import { registerNotificationActions } from "@/utils/NotificationsUtils";
import { PushTokenProvider } from "@/contexts/PushTokenContext";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from 'expo-notifications';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import 'react-native-reanimated';

type NotificationData = {
  url?: string;
  params?: {
    id?: number | string;
    consultasId?: number | string;
  };
  NoticiaId?: number | string;
  ConsultasId?: number | string;
  TipoConsultaId?: number;
  TipoNotificacion?: number | string;
  EPais?: number;
  PautaId?: number;
  UserName?: string;
};

function getNewsIdFromUrl(url?: string) {
  const match = url?.match(/\/news\/([^/?]+)/);
  return match?.[1];
}

function openNotificationDetail(data: NotificationData) {
  const noticiaId = data.params?.id ?? data.NoticiaId ?? getNewsIdFromUrl(data.url);
  const consultasId = data.params?.consultasId ?? data.ConsultasId;

  if (!noticiaId) {
    console.warn("La notificación no tiene NoticiaId para navegar al detalle", data);
    return;
  }

  router.push({
    pathname: '/news/[id]',
    params: {
      id: String(noticiaId),
      ...(consultasId ? { consultasId: String(consultasId) } : {}),
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

      const data = response.notification.request.content.data as NotificationData;
      console.log("JSON recibido al tocar la notificación:", JSON.stringify(data, null, 2));
      console.log("Respuesta completa de la notificación:", JSON.stringify(response, null, 2));
      openNotificationDetail(data);
      void Notifications.clearLastNotificationResponseAsync();
    }

    const notificationSubscription = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data;
      console.log("JSON recibido con la app abierta:", JSON.stringify(data, null, 2));
      console.log("Notificación completa recibida:", JSON.stringify(notification, null, 2));
    });

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
      notificationSubscription.remove();
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
