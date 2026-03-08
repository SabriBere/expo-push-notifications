import { PropsWithChildren, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import * as Notifications from 'expo-notifications';


Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export function Collapsible() {

  async function triggerPushNotifications({ children, title }: PropsWithChildren & { title: string }) {

    try {
      //Configurar canal (iOS)
      const settings = await Notifications.requestPermissionsAsync();
      // console.log(settings, 'qué devuelve en settings')
      if (settings.status !== "granted") return;

      if (settings.status !== 'granted') {
        const request = await Notifications.requestPermissionsAsync();
        settings.status = request.status;
      }

      if (settings.status !== 'granted') {
        Alert.alert('Permisos requeridos', 'No se otorgaron permisos para notificaciones.');
        return;
      }

      //Solo necesario para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
        });
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Notificación de prueba',
          body: 'Esta es una alerta local en iOS 🚀',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
        },
      });


    } catch (error) {
        console.error('Error al disparar notificación:', error);
        Alert.alert('Error', 'No se pudo disparar la notificación.');//Aca mostrar un toast
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Pressable style={styles.button} onPress={triggerPushNotifications}>
        <Text style={styles.text}>Test notificación iOS</Text>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
