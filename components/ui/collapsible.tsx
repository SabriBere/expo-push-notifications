import { ThemedView } from '@/components/themed-view';
import * as Notifications from 'expo-notifications';
import { Alert, Linking, Platform, Pressable, StyleSheet, Text } from 'react-native';


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

      //Si las desactivo y las quiere volver a activar
      if (!settings.granted) {
          if (!settings.canAskAgain) {
          Alert.alert(
            "Notificaciones desactivadas",
            "Debes habilitarlas desde la configuración",
            [
              {
                text: "Abrir Configuración",
                onPress: () => Linking.openSettings()
              }
            ]
          );
        } else {
              await Notifications.requestPermissionsAsync();
        }
      }


      //Solo necesario para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
        });
      }

      //depende de cada OS
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Praetorian",
          subtitle: "Noticias", //solo disponible para iOS
          body: 'Esta es una alerta local en iOS/Android 🚀',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
        },
      });


    } catch (error) {
        //Agregar textos en varios idiomas
        console.error('Error al disparar notificación:', error);
        Alert.alert('Permiso no garantizado', 'No se otorgaron permisos para notificaciones.');
    }
  }

  //Desuscripción notificaciones de settings o ajustes - Guia al usuario.
  async function triggerSettingsPermissions() {
    // console.log('ingresa aca?')
    //Lleva al usuario a los settings
    Alert.alert(
    "Notificaciones",
    "Para desactivar las notificaciones debes hacerlo desde la configuración del sistema.",
    [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Abrir configuración",
        onPress: () => Linking.openSettings(),
      },
    ]
  );
  }

  return (
    <ThemedView style={styles.container}>
      <Pressable style={styles.button} onPress={() => triggerPushNotifications()}>
        <Text style={styles.text}>Test notificación iOS/android</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => triggerSettingsPermissions()}>
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
