import { ThemedView } from '@/components/themed-view';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef, useState } from 'react';
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

export function Collapsible() {
  const [systemNotificationsEnabled, setSystemNotificationsEnabled] = useState(false);
  const [realtimeAlertsEnabled, setRealtimeAlertsEnabled] = useState(true);
  const appState = useRef(AppState.currentState);

  async function checkSystemPermissions() {
    const settings = await Notifications.getPermissionsAsync();
    setSystemNotificationsEnabled(settings.granted);
    return settings;
  }

  useEffect(() => {
    checkSystemPermissions();

    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        await checkSystemPermissions();
      }

      appState.current = nextState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  //Permite activar/desactivar notificaciones push
  async function triggerSettingsPermissions() {
    Alert.alert(
      'Notificaciones',
      systemNotificationsEnabled
        ? 'Para desactivar las notificaciones debes hacerlo desde la configuración del sistema.'
        : 'Para activar las notificaciones debes hacerlo desde permisos o configuración del sistema.',
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
});