'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type TableName = 'students' | 'grades' | 'courses' | 'profiles';
type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeSubscriptionOptions<T extends Record<string, unknown>> {
  table: TableName;
  event?: EventType;
  filter?: string;
  onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onChange?: (payload: RealtimePostgresChangesPayload<T>) => void;
  enabled?: boolean;
}

interface RealtimeStatus {
  isConnected: boolean;
  isSubscribed: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

/**
 * Custom hook untuk mengelola Supabase Realtime subscriptions
 * dengan automatic reconnection dan error handling
 */
export function useRealtimeSubscription<T extends Record<string, unknown> = Record<string, unknown>>(
  options: UseRealtimeSubscriptionOptions<T>
) {
  const {
    table,
    event = '*',
    filter,
    onInsert,
    onUpdate,
    onDelete,
    onChange,
    enabled = true,
  } = options;

  const [status, setStatus] = useState<RealtimeStatus>({
    isConnected: false,
    isSubscribed: false,
    error: null,
    lastUpdate: null,
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 2000; // 2 seconds

  useEffect(() => {
    if (!enabled) {
      cleanup();
      return;
    }

    setupSubscription();

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, event, filter, enabled]);

  const setupSubscription = () => {
    try {
      // Create unique channel name
      const channelName = `realtime:${table}:${Date.now()}`;
      
      // Create channel
      const channel = supabase.channel(channelName);

      // Configure postgres changes listener
      const changeConfig: Parameters<typeof channel.on>[1] = {
        event,
        schema: 'public',
        table,
        ...(filter && { filter }),
      };

      channel.on(
        'postgres_changes',
        changeConfig as never,
        (payload: RealtimePostgresChangesPayload<T>) => {
          try {
            // Update last update timestamp
            setStatus(prev => ({
              ...prev,
              lastUpdate: new Date(),
              error: null,
            }));

            // Call appropriate callback based on event type
            if (payload.eventType === 'INSERT' && onInsert) {
              onInsert(payload);
            } else if (payload.eventType === 'UPDATE' && onUpdate) {
              onUpdate(payload);
            } else if (payload.eventType === 'DELETE' && onDelete) {
              onDelete(payload);
            }

            // Call general onChange callback
            if (onChange) {
              onChange(payload);
            }

            // Reset reconnect attempts on successful update
            reconnectAttemptsRef.current = 0;
          } catch (error) {
            console.error('Error handling realtime update:', error);
            setStatus(prev => ({
              ...prev,
              error: error instanceof Error ? error.message : 'Unknown error',
            }));
          }
        }
      );

      // Subscribe to channel
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setStatus(prev => ({
            ...prev,
            isConnected: true,
            isSubscribed: true,
            error: null,
          }));
          reconnectAttemptsRef.current = 0;
          console.log(`✅ Subscribed to ${table} realtime updates`);
        } else if (status === 'CHANNEL_ERROR') {
          setStatus(prev => ({
            ...prev,
            isConnected: false,
            isSubscribed: false,
            error: 'Channel error occurred',
          }));
          console.error(`❌ Channel error for ${table}`);
          attemptReconnect();
        } else if (status === 'TIMED_OUT') {
          setStatus(prev => ({
            ...prev,
            isConnected: false,
            isSubscribed: false,
            error: 'Connection timed out',
          }));
          console.error(`⏱️ Connection timed out for ${table}`);
          attemptReconnect();
        } else if (status === 'CLOSED') {
          setStatus(prev => ({
            ...prev,
            isConnected: false,
            isSubscribed: false,
          }));
          console.log(`🔌 Connection closed for ${table}`);
        }
      });

      channelRef.current = channel;
    } catch (error) {
      console.error('Error setting up subscription:', error);
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to setup subscription',
      }));
      attemptReconnect();
    }
  };

  const attemptReconnect = () => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error(`❌ Max reconnection attempts (${maxReconnectAttempts}) reached for ${table}`);
      setStatus(prev => ({
        ...prev,
        error: 'Max reconnection attempts reached',
      }));
      return;
    }

    reconnectAttemptsRef.current += 1;
    console.log(`🔄 Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);

    // Clear existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Schedule reconnection
    reconnectTimeoutRef.current = setTimeout(() => {
      cleanup();
      setupSubscription();
    }, reconnectDelay * reconnectAttemptsRef.current); // Exponential backoff
  };

  const cleanup = () => {
    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Unsubscribe from channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Reset status
    setStatus({
      isConnected: false,
      isSubscribed: false,
      error: null,
      lastUpdate: null,
    });
  };

  const reconnect = () => {
    reconnectAttemptsRef.current = 0;
    cleanup();
    setupSubscription();
  };

  return {
    status,
    reconnect,
  };
}
