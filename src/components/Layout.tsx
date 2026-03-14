import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { 
  Users, 
  LayoutDashboard, 
  MessageSquare, 
  ScanFace, 
  LogOut, 
  Menu, 
  X,
  Stethoscope,
  Hospital,
  FileText,
  Settings,
  Bell,
  Search,
  User as UserIcon,
  MapPin,
  WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { TelemedicineSession as SessionType } from '../types';
import { IncomingConsultationPopup } from './IncomingConsultationPopup';
import { DoctorCallInterface } from './DoctorCallInterface';
import { useLanguage } from '../contexts/LanguageContext';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [incomingSession, setIncomingSession] = React.useState<SessionType | null>(null);
  const [activeCall, setActiveCall] = React.useState<SessionType | null>(null);

  React.useEffect(() => {
    if (user?.role !== 'doctor') return;

    const q = query(
      collection(db, 'sessions'), 
      where('doctorId', '==', user.uid), 
      where('status', '==', 'waiting')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data();
        const startTime = new Date(docData.startTime).getTime();
        const now = Date.now();
        
        // Only show if request is less than 5 minutes old
        if (now - startTime < 300000) {
          setIncomingSession({ id: snapshot.docs[0].id, ...docData } as SessionType);
        } else {
          setIncomingSession(null);
        }
      } else {
        setIncomingSession(null);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleJoin = async (session: SessionType) => {
    try {
      const sessionRef = doc(db, 'sessions', session.id);
      await updateDoc(sessionRef, { status: 'active' });
      setActiveCall(session);
      setIncomingSession(null);
    } catch (err) {
      console.error("Failed to join session:", err);
    }
  };

  const handleDecline = async (session: SessionType) => {
    try {
      const sessionRef = doc(db, 'sessions', session.id);
      await updateDoc(sessionRef, { status: 'declined' });
      setIncomingSession(null);
    } catch (err) {
      console.error("Failed to decline session:", err);
    }
  };
  
  const navItems = user?.role === 'worker' ? [
    { icon: LayoutDashboard, label: 'Health Worker Dashboard', path: '/' },
    { icon: Users, label: 'Patients', path: '/patients' },
    { icon: MessageSquare, label: 'AI Assistant', path: '/ai-assistant' },
    { icon: ScanFace, label: 'Skin Check', path: '/skin-check' },
    { icon: Hospital, label: 'Hospitals', path: '/hospitals' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ] : [
    { icon: LayoutDashboard, label: 'Doctor Dashboard', path: '/' },
    { icon: Users, label: 'Patient Queue', path: '/pending-cases' },
    { icon: MapPin, label: 'Map View', path: '/map' },
    { icon: FileText, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-gray-800">
      {/* Sidebar - Always visible as w-64 except maybe tiny mobile, but user requested always visible w-64 */}
      <aside className="w-64 bg-white shadow-md h-full z-10 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Logo />
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-blue-600' : 'text-gray-400'}`} />
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10 shrink-0">
          {/* Left: App Logo / Title (Visible on mobile if sidebar is hidden, but required by instructions) */}
          <div className="flex items-center gap-4">
             {/* If sidebar is fixed, we might just put a page title or mobile collapse here */}
             <div className="font-bold text-xl text-gray-800 hidden md:block">SwasthyaSetu AI</div>
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
               <Menu className="w-5 h-5" />
             </button>
          </div>

          {/* Right: Language Selector */}
          <div className="flex items-center gap-6">
            <LanguageSwitcher />
            
            <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
               <div className="flex flex-col items-end">
                 <span className="text-sm font-bold text-gray-900">{user?.name}</span>
                 <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">{user?.role}</span>
               </div>
               <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                 {user?.name?.[0] || <UserIcon className="w-5 h-5" />}
               </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay fallback if screen is too small to fit the 64w sidebar side-by-side */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -280 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -280 }}
              className="md:hidden fixed inset-y-0 left-0 w-64 bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                <Logo />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'text-blue-700 bg-blue-50'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-blue-600' : 'text-gray-400'}`} />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full space-y-6">
            {children}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {incomingSession && (
          <IncomingConsultationPopup 
            session={incomingSession}
            onJoin={handleJoin}
            onDecline={handleDecline}
          />
        )}
      </AnimatePresence>

      {activeCall && (
        <DoctorCallInterface 
          session={activeCall}
          onClose={() => setActiveCall(null)}
        />
      )}
    </div>
  );
};
