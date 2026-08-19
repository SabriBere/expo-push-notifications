import { ThemedView } from '@/components/themed-view';
import { useExpoPushToken } from '@/contexts/PushTokenContext';
import { useNotificationSocket } from '@/hooks/use-notification-socket';
import { registerForPushNotificationsAsync } from '@/utils/NotificationsUtils';
import * as Notifications from 'expo-notifications';
import React, { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  Linking,
  StyleSheet,
  Switch,
  Text,
  View
} from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: () => Promise.resolve({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    threadIdentifier: true
  }),
});

type CollapsibleProps = {
  children?: ReactNode;
  title?: string;
};

export function Collapsible(_props: CollapsibleProps) {
  const [systemNotificationsEnabled, setSystemNotificationsEnabled] = useState(false);
  const [realtimeAlertsEnabled, setRealtimeAlertsEnabled] = useState(true);
  useNotificationSocket(realtimeAlertsEnabled);
  const { setExpoPushToken } = useExpoPushToken();
  const appState = useRef(AppState.currentState);

  async function checkSystemPermissions() {
    const settings = await Notifications.getPermissionsAsync();
    setSystemNotificationsEnabled(settings.granted);

    if (!settings.granted) {
      setExpoPushToken(null);
    }

    return settings;
  }

  async function syncExpoPushTokenWithBackend(token: string) {
    const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;
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
      throw new Error(
        `Backend push token registration failed with status ${response.status}: ${await response.text()}`
      );
    }

    console.log("Expo push token registered in backend");
  }

  async function restoreExpoPushTokenIfEnabled() {
    const settings = await checkSystemPermissions();
    if (!settings.granted) return;

    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
        console.info('Expo push token restored');
        await syncExpoPushTokenWithBackend(token);
      }
    } catch (error) {
      console.error("Error restoring Expo push token", error);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(restoreExpoPushTokenIfEnabled);

    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        await restoreExpoPushTokenIfEnabled();
      }

      appState.current = nextState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  async function registerDeviceToken() {
    try {
      const token = await registerForPushNotificationsAsync();
      const settings = await checkSystemPermissions();

      if (!token) {
        setExpoPushToken(null);
        setSystemNotificationsEnabled(settings.granted);
        return;
      }

      setExpoPushToken(token);
      setSystemNotificationsEnabled(true);
      console.info('Expo push token generated');
      await syncExpoPushTokenWithBackend(token);
    } catch (error) {
      console.error("Error registering Expo push token", error);
    }
  }

  async function triggerSettingsPermissions(value: boolean) {
    if (value) {
      await registerDeviceToken();
      return;
    }

    Alert.alert(
      'Notifications',
      'To turn notifications off, change them from system settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open settings',
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  }

  function sendUnsuscribeAlerts(value: boolean) {
    setRealtimeAlertsEnabled(value);
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <View
          style={[
            styles.statusRail,
            systemNotificationsEnabled ? styles.statusRailOn : styles.statusRailOff,
          ]}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>System notifications</Text>
          <Text style={styles.description}>
            {systemNotificationsEnabled
              ? 'Enabled. The device can show banners, sound, and badges.'
              : 'Disabled. Enable them from permissions or settings.'}
          </Text>
        </View>

        <View style={styles.switchContainer}>
          <Text
            style={[
              styles.statusText,
              systemNotificationsEnabled ? styles.statusTextOn : styles.statusTextOff,
            ]}>
            {systemNotificationsEnabled ? 'On' : 'Off'}
          </Text>
          <Switch
            value={systemNotificationsEnabled}
            onValueChange={triggerSettingsPermissions}
            trackColor={{ false: '#2A3034', true: '#0F766E' }}
            thumbColor={systemNotificationsEnabled ? '#CCFBF1' : '#F8FAFC'}
            ios_backgroundColor="#2A3034"
          />
        </View>
      </View>

      <View style={styles.card}>
        <View
          style={[
            styles.statusRail,
            realtimeAlertsEnabled ? styles.statusRailOn : styles.statusRailOff,
          ]}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Real-time alerts</Text>
          <Text style={styles.description}>
            {realtimeAlertsEnabled
              ? 'Subscribed. The app can receive alerts from the socket/backend.'
              : 'Unsubscribed. Real-time alerts are paused.'}
          </Text>
        </View>

        <View style={styles.switchContainer}>
          <Text
            style={[
              styles.statusText,
              realtimeAlertsEnabled ? styles.statusTextOn : styles.statusTextOff,
            ]}>
            {realtimeAlertsEnabled ? 'Online' : 'Paused'}
          </Text>
          <Switch
            value={realtimeAlertsEnabled}
            onValueChange={sendUnsuscribeAlerts}
            trackColor={{ false: '#2A3034', true: '#16A34A' }}
            thumbColor={realtimeAlertsEnabled ? '#DCFCE7' : '#F8FAFC'}
            ios_backgroundColor="#2A3034"
          />
        </View>
      </View>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 6,
    gap: 14,
  },
  card: {
    backgroundColor: '#151B1D',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#243236',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 3,
  },
  statusRail: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 999,
  },
  statusRailOn: {
    backgroundColor: '#22C55E',
  },
  statusRailOff: {
    backgroundColor: '#475569',
  },
  textContainer: {
    flex: 1,
    gap: 7,
  },
  title: {
    color: '#fff',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },
  description: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  testButton: {
    backgroundColor: '#1f6feb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  switchContainer: {
    width: 90,
    alignItems: 'flex-end',
    gap: 8,
  },
  statusText: {
    maxWidth: 90,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 999,
    overflow: 'hidden',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusTextOn: {
    color: '#A7F3D0',
    backgroundColor: 'rgba(34, 197, 94, 0.14)',
  },
  statusTextOff: {
    color: '#CBD5E1',
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
  },
});
