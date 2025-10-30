'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchSystemStatus, SystemStatus } from '@/lib/api';

interface UseVMDataResult {
  data: SystemStatus | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isConnected: boolean;
}

/**
 * Custom hook to fetch and poll VM data from the backend API
 * @param pollInterval - Polling interval in milliseconds (default: 3000ms = 3 seconds)
 */
export function useVMData(pollInterval: number = 3000): UseVMDataResult {
  const [data, setData] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    try {
      const status = await fetchSystemStatus();
      setData(status);
      setError(null);
      setIsConnected(true);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching VM data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setIsConnected(false);
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [fetchData, pollInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    isConnected,
  };
}
