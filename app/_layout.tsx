import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
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
  const colorScheme = useColorScheme();
  useNotificationObserver();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
