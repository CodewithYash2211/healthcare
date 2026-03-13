import { getCases, updateCase } from '../localStore';

export interface SyncTask {
  id: string;
  type: 'SAVE_PATIENT' | 'SAVE_RECORD';
  payload: any;
  timestamp: number;
}

export const getPendingSyncTasks = (): SyncTask[] => {
  const syncQueue = localStorage.getItem('sehatsetu_sync_queue');
  return syncQueue ? JSON.parse(syncQueue) : [];
};

export const addSyncTask = (task: Omit<SyncTask, 'id' | 'timestamp'>) => {
  const tasks = getPendingSyncTasks();
  const newTask: SyncTask = {
    ...task,
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };
  
  tasks.push(newTask);
  localStorage.setItem('sehatsetu_sync_queue', JSON.stringify(tasks));
  
  // Try to sync immediately if online
  if (navigator.onLine) {
    flushSyncQueue();
  }
};

export const removeSyncTask = (taskId: string) => {
  const tasks = getPendingSyncTasks();
  const updatedTasks = tasks.filter(t => t.id !== taskId);
  localStorage.setItem('sehatsetu_sync_queue', JSON.stringify(updatedTasks));
};

export const flushSyncQueue = async () => {
  if (!navigator.onLine) return;

  const tasks = getPendingSyncTasks();
  const cases = getCases();
  const pendingCases = cases.filter(c => c.syncStatus === 'pending');
  
  if (tasks.length === 0 && pendingCases.length === 0) return;

  console.log(`[SyncManager] Flushing ${tasks.length} pending tasks and ${pendingCases.length} local cases...`);

  // In a real app, you would iterate and send these via API.
  // Since we rely on localStore, the "sync" here just processes the queue
  // against the real local store elements if they haven't been already.
  // Actually, since this app is purely localStore based, offline IS online.
  // But to simulate "sending to remote", we will clear the queue to signify "synced".
  
  // Update all pending cases to synced
  pendingCases.forEach(c => {
    updateCase(c.id, { syncStatus: 'synced' });
  });

  // Simulation of network delay for syncing
  setTimeout(() => {
    localStorage.removeItem('sehatsetu_sync_queue');
    console.log('[SyncManager] All tasks synced successfully.');
    // Dispatch a custom event to notify the UI that sync is complete
    window.dispatchEvent(new CustomEvent('sehatsetu:sync-complete'));
  }, 1500);
};

// Listen for network changes
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[SyncManager] Network connection restored. Initiating sync...');
    flushSyncQueue();
  });
}
