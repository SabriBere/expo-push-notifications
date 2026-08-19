import { registerNotificationActions } from "@/utils/NotificationsUtils";
import { PushTokenProvider } from "@/contexts/PushTokenContext";
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from 'expo-router/react-navigation';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from 'expo-notifications';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import type { DemoNotificationData } from '@/types/demoNotification';
import 'react-native-reanimated';

function getItemIdFromUrl(url?: string) {
  const match = url?.match(/\/demo-items\/([^/?]+)/);
  return match?.[1];
}

function openNotificationDetail(data: DemoNotificationData) {
  const itemId = data.itemId ?? getItemIdFromUrl(data.url);

  if (!itemId) {
    console.warn("Notification payload has no itemId for detail navigation", data);
    return;
  }

  router.push({
    pathname: '/demo-items/[id]',
    params: {
      id: String(itemId),
      ...(data.contextId ? { contextId: String(data.contextId) } : {}),
    },
  });
}

export const unstable_settings = {
  anchor: '(tabs)',
};

//Manejo de deep linking
function useNotificationObserver() {
  const handledNotificationId = useRef<string | null>(null);

  useEffect(() => {
    registerNotificationActions();

    function handleNotificationResponse(response: Notifications.NotificationResponse) {
      const notificationId = response.notification.request.identifier;

      if (handledNotificationId.current === notificationId) {
        return;
      }

      handledNotificationId.current = notificationId;

      const data = response.notification.request.content.data as DemoNotificationData;
      // console.log("JSON recibido al tocar la notificación:", JSON.stringify(data, null, 2));
      // console.log("Respuesta completa de la notificación:", JSON.stringify(response, null, 2));
      openNotificationDetail(data);
      void Notifications.clearLastNotificationResponseAsync();
    }

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotificationResponse(response);
    });

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        console.log("JSON recibido al abrir la app desde la notificación:", JSON.stringify(response.notification.request.content.data, null, 2));
        handleNotificationResponse(response);
      }
    });

    return () => {
      responseSubscription.remove();
    };
  }, []);
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const colorScheme = useColorScheme();
  useNotificationObserver();

  return (

    <QueryClientProvider client={queryClient}>
      <PushTokenProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </PushTokenProvider>
    </QueryClientProvider>
  );
}
