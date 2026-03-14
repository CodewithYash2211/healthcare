import React, { useEffect, useState } from 'react';
import AgoraRTC, { 
  IAgoraRTCClient, 
  ICameraVideoTrack, 
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser
} from 'agora-rtc-sdk-ng';
import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  updateDoc,
  deleteDoc,
  getDoc 
} from 'firebase/firestore';
import { TelemedicineSession as SessionType, Patient } from '../types';
import { VideoCallInterface } from './VideoCallInterface';
import { useAuth } from '../contexts/AuthContext';
import { AGORA_APP_ID } from '../agoraConfig';

interface TelemedicineSessionProps {
  patient: Patient;
  sessionType: 'voice' | 'video';
  onClose: () => void;
  existingSessionId?: string;
  symptoms?: string;
  doctorId?: string;
}

export const TelemedicineSession = ({
  patient,
  sessionType,
  onClose,
  existingSessionId,
  symptoms,
  doctorId
}: TelemedicineSessionProps) => {
  const { user } = useAuth();
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUser, setRemoteUser] = useState<IAgoraRTCRemoteUser | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(sessionType === 'voice');
  const [sessionId, setSessionId] = useState<string | null>(existingSessionId || null);
  const [livePatient, setLivePatient] = useState<Patient>(patient);

  useEffect(() => {
    // Listen for patient updates (real-time vitals)
    const patientRef = doc(db, 'patients', patient.id);
    const unsubscribePatient = onSnapshot(patientRef, (doc) => {
      if (doc.exists()) {
        setLivePatient({ id: doc.id, ...doc.data() } as Patient);
      }
    });

    const initAgora = async () => {
      const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      setClient(agoraClient);

      agoraClient.on('user-published', async (user, mediaType) => {
        await agoraClient.subscribe(user, mediaType);
        if (mediaType === 'video') {
          setRemoteUser(user);
          setIsConnected(true);
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });

      agoraClient.on('user-unpublished', (user) => {
        if (user.uid === remoteUser?.uid) {
          setRemoteUser(null);
          setIsConnected(false);
        }
      });

      const channelName = existingSessionId || `session_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        await agoraClient.join(AGORA_APP_ID, channelName, null, user?.uid || null);

        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        setLocalAudioTrack(audioTrack);

        let videoTrack = null;
        if (sessionType === 'video') {
          videoTrack = await AgoraRTC.createCameraVideoTrack();
          setLocalVideoTrack(videoTrack);
          if (isVideoMuted) await videoTrack.setEnabled(false);
        }

        await agoraClient.publish(videoTrack ? [audioTrack, videoTrack] : [audioTrack]);

        if (!existingSessionId) {
          const sessionRef = doc(collection(db, 'sessions'));
          setSessionId(sessionRef.id);
          
          // Listen for session updates (e.g., doctor declining)
          const unsubscribeSession = onSnapshot(sessionRef, (snapshot) => {
            const data = snapshot.data();
            if (data?.status === 'declined') {
              alert('The doctor has declined the consultation request.');
              onClose();
            }
          });

          await setDoc(sessionRef, {
            patientId: patient.id,
            workerId: user?.uid,
            workerName: user?.name,
            patientName: patient.name,
            symptoms: symptoms || '',
            doctorId: doctorId || null,
            startTime: new Date().toISOString(),
            status: 'waiting',
            type: sessionType,
            channelName: channelName,
          });

          return () => unsubscribeSession();
        } else {
          const sessionRef = doc(db, 'sessions', existingSessionId);
          await updateDoc(sessionRef, {
            status: 'active',
            doctorId: user?.uid
          });
        }
      } catch (error) {
        console.error('Agora join failed', error);
      }
    };

    initAgora();

    return () => {
      const leave = async () => {
        if (localAudioTrack) {
          localAudioTrack.stop();
          localAudioTrack.close();
        }
        if (localVideoTrack) {
          localVideoTrack.stop();
          localVideoTrack.close();
        }
        if (client) {
          await client.leave();
        }
      };
      leave();
      unsubscribePatient();
    };
  }, []);

  const handleEndCall = async () => {
    if (sessionId) {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        status: 'completed',
        endTime: new Date().toISOString()
      });
    }
    onClose();
  };

  const handleToggleAudio = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(isAudioMuted);
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const handleToggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(isVideoMuted);
      setIsVideoMuted(!isVideoMuted);
    }
  };

  return (
    <VideoCallInterface
      localVideoTrack={localVideoTrack}
      remoteVideoTrack={remoteUser?.videoTrack || null}
      onEndCall={handleEndCall}
      patient={livePatient}
      isConnected={isConnected}
      isAudioMuted={isAudioMuted}
      isVideoMuted={isVideoMuted}
      onToggleAudio={handleToggleAudio}
      onToggleVideo={handleToggleVideo}
    />
  );
};
