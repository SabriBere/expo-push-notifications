import { ThemedView } from '@/components/themed-view';
import * as Notifications from 'expo-notifications';
import { Alert, Platform, Pressable, StyleSheet, Text } from 'react-native';


Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export function Collapsible() {

  //Configuración de notificaciones
  async function triggerPushNotifications() {

    try {
      //Configurar canal (iOS)
      const settings = await Notifications.requestPermissionsAsync();
      console.log(settings, 'qué devuelve en settings')
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
          title: "Praetorian",
          subtitle: "Noticias",
          body: 'Esta es una alerta local en iOS/Android 🚀',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Platform.OS === "ios"? 0 : 1,
        },
      });


    } catch (error) {
        console.error('Error al disparar notificación:', error);
        Alert.alert('Error', 'No se pudo disparar la notificación.');
    }
  }

  //Desuscripción manual de notificaciones desde UI
  async function triggerForgotPermissions() {}

  return (
    <ThemedView style={styles.container}>
      <Pressable style={styles.button} onPress={() => triggerPushNotifications()}>
        <Text style={styles.text}>Test notificación iOS/android</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => triggerForgotPermissions()}>
        <Text style={styles.text}>Test olvidar permisos</Text>
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
