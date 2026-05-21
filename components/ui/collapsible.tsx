import { ThemedView } from '@/components/themed-view';
import { useExpoPushToken } from '@/contexts/PushTokenContext';
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
  handleNotification: async () => ({
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
  const { expoPushToken, setExpoPushToken } = useExpoPushToken();
  const appState = useRef(AppState.currentState);

  async function checkSystemPermissions() {
    const settings = await Notifications.getPermissionsAsync();
    setSystemNotificationsEnabled(settings.granted);

    if (!settings.granted) {
      setExpoPushToken(null);
    }

    return settings;
  }

  async function restoreExpoPushTokenIfEnabled() {
    const settings = await checkSystemPermissions();
    if (!settings.granted) return;

    try {
      const token = await registerForPushNotificationsAsync();
      if (token) setExpoPushToken(token);
    } catch (error) {
      console.error("Error restoring Expo push token", error);
    }
  }

  useEffect(() => {
    restoreExpoPushTokenIfEnabled();

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

  //Permite activar/desactivar notificaciones push
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
      console.log("Expo push token:", token);

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

  async function triggerSettingsPermissions(value: boolean) {
    if (value) {
      await registerDeviceToken();
      return;
    }

    Alert.alert(
      'Notificaciones',
      'Para desactivar las notificaciones debes hacerlo desde la configuración del sistema.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abrir configuración',
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  }

  //Desuscribirse del websocket
  function sendUnsuscribeAlerts(value: boolean) {
    setRealtimeAlertsEnabled(value);

    if (value) {
      console.log('Suscribir nuevamente al socket / backend');
      return;
    }

    console.log('Desuscribir del socket / avisar a backend que no envíe más alertas');
  }

  return (
    <ThemedView style={styles.container}>
      {/* Permite activar/desactivar notificaciones push */}
      <View style={styles.card}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Notificaciones del sistema</Text>
          <Text style={styles.description}>
            {systemNotificationsEnabled
              ? 'Activadas. El dispositivo puede mostrar banners, sonido y badge.'
              : 'Desactivadas. Debes habilitarlas desde permisos o configuración.'}
          </Text>
        </View>

        <Switch
          value={systemNotificationsEnabled}
          onValueChange={triggerSettingsPermissions}
        />
      </View>

      {/* Simula la recepción de notificaciones push + revisión de permisos */}
      <View style={styles.card}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Alertas en tiempo real</Text>
          <Text style={styles.description}>
            {realtimeAlertsEnabled
              ? 'Suscripta. La app puede recibir alertas desde socket/backend.'
              : 'Desuscripta. Deja de recibir alertas en tiempo real.'}
          </Text>
        </View>

        <Switch
          value={realtimeAlertsEnabled}
          onValueChange={sendUnsuscribeAlerts}
        />
      </View>

      {systemNotificationsEnabled && expoPushToken ? (
        <View style={styles.tokenCard}>
          <Text style={styles.title}>ExpoPushToken generado</Text>
          <Text selectable style={styles.tokenText}>
            {expoPushToken}
          </Text>
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textContainer: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    color: '#ddd',
    fontSize: 14,
    fontWeight: '400',
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
  tokenCard: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  tokenText: {
    color: '#ddd',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
});
