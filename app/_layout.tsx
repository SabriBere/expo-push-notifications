import { registerForPushNotificationsAsync, registerNotificationActions } from "@/context/NotificationsUtils";
import { SocketProvider } from "@/context/SocketContext";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from 'expo-notifications';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

type NotificationData = {
  url?: any;
  params: any
};

export const unstable_settings = {
  anchor: '(tabs)',
};

//Manejo de deep linking
function useNotificationObserver() {

  useEffect(() => {
    registerNotificationActions();
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as NotificationData;
      const url = data.url;
      const { consultasId } = data.params

      if (url) {
        router.push({
          pathname: url,
          params: {
            consultasId: consultasId,
          },
        })
      }
    });

    return () => subscription.remove();
  }, []);
}

function usePushRegistration() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const socketUrl = process.env.EXPO_PUBLIC_API_SOCKET;
    const apiBaseUrl =
      process.env.EXPO_PUBLIC_API_URL ??
      socketUrl?.replace(/^ws:\/\//, "http://").replace(/:\d+$/, ":8000");

    async function registerDevice() {
      try {
        const token = await registerForPushNotificationsAsync();

        if (!isMounted || !token) return;

        setExpoPushToken(token);
        console.log("Expo push token:", token);
        console.log("Expo push registration URL:", apiBaseUrl);

        if (!apiBaseUrl) {
          console.warn(
            "Missing EXPO_PUBLIC_API_URL. Skipping backend push token registration."
          );
          return;
        }

        const response = await fetch(`${apiBaseUrl}/push-tokens/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          console.error(
            "Error registering Expo push token in backend",
            response.status,
            await response.text()
          );
          return;
        }

        console.log("Expo push token registered in backend");
      } catch (error) {
        console.error("Error registering Expo push token", error);
      }
    }

    registerDevice();

    return () => {
      isMounted = false;
    };
  }, []);

  return expoPushToken;
}

export default function RootLayout() {
  const queryClient = new QueryClient();
  const colorScheme = useColorScheme();
  useNotificationObserver();
  usePushRegistration();

  return (

    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SocketProvider>
    </QueryClientProvider>
  );
}
