import { useState, useEffect, useCallback } from "react";

const SYNC_KEY = "pos_offline_queue";

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const queue = JSON.parse(localStorage.getItem(SYNC_KEY) || "[]");
    setPendingCount(queue.length);
  }, [isOnline, syncing]);

  const addToQueue = useCallback((operation) => {
    const queue = JSON.parse(localStorage.getItem(SYNC_KEY) || "[]");
    queue.push({ ...operation, timestamp: new Date().toISOString() });
    localStorage.setItem(SYNC_KEY, JSON.stringify(queue));
    setPendingCount(queue.length);
  }, []);

  const clearQueue = useCallback(() => {
    localStorage.removeItem(SYNC_KEY);
    setPendingCount(0);
  }, []);

  const getQueue = useCallback(() => {
    return JSON.parse(localStorage.getItem(SYNC_KEY) || "[]");
  }, []);

  const removeFromQueue = useCallback((index) => {
    const queue = JSON.parse(localStorage.getItem(SYNC_KEY) || "[]");
    queue.splice(index, 1);
    localStorage.setItem(SYNC_KEY, JSON.stringify(queue));
    setPendingCount(queue.length);
  }, []);

  return {
    isOnline,
    syncing,
    setSyncing,
    pendingCount,
    addToQueue,
    clearQueue,
    getQueue,
    removeFromQueue,
  };
}
