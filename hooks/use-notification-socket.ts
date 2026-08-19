import type { DemoNotification } from '@/types/demoNotification';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

type NotificationSocketMessage = {
  type: 'notificationBatch';
  data: DemoNotification[];
};

function isNotificationBatch(value: unknown): value is NotificationSocketMessage {
  if (typeof value !== 'object' || value === null) return false;

  const message = value as Partial<NotificationSocketMessage>;
  return message.type === 'notificationBatch' && Array.isArray(message.data);
}

function getNotificationSocketUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_WS_URL;
  if (configuredUrl) return configuredUrl;

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) return null;

  return apiUrl
    .replace(/^http:/, 'ws:')
    .replace(/^https:/, 'wss:')
    .replace(/:8000\/?$/, ':8001');
}

export function useNotificationSocket(enabled: boolean) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsConnected(false);
      return;
    }

    const socketUrl = getNotificationSocketUrl();
    if (!socketUrl) {
      console.warn(
        'Missing EXPO_PUBLIC_WS_URL and EXPO_PUBLIC_API_URL. Real-time alerts are unavailable.'
      );
      setIsConnected(false);
      return;
    }

    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    const connect = () => {
      socket = new WebSocket(socketUrl);

      socket.onopen = () => {
        setIsConnected(true);
        socket?.send(JSON.stringify({ type: 'requestNotifications' }));
      };

      socket.onmessage = (event) => {
        try {
          const message: unknown = JSON.parse(String(event.data));
          if (!isNotificationBatch(message)) return;

          queryClient.setQueryData(['notifications'], { data: message.data });
        } catch {
          console.warn('Received an invalid WebSocket notification payload');
        }
      };

      socket.onerror = () => setIsConnected(false);
      socket.onclose = () => {
        setIsConnected(false);
        if (!disposed) reconnectTimer = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [enabled, queryClient]);

  return isConnected;
}
