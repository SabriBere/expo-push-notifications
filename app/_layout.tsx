import { SocketProvider } from "@/context/SocketContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';


type NotificationData = {
  url?: any;
  params:any
};

export const unstable_settings = {
  anchor: '(tabs)',
};

//Manejo de deep linking
function useNotificationObserver() {

  useEffect(() => {
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

export default function RootLayout() {
  const queryClient = new QueryClient();
  const colorScheme = useColorScheme();
  useNotificationObserver();

  return (
    <SocketProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </QueryClientProvider>
    </SocketProvider>
  );
}
