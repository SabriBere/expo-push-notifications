import * as Notifications from "expo-notifications";
import { useState } from "react";
import { Alert, Linking, Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    threadIdentifier: true
  }),
});

export  async function triggerPushNotifications(notifications: any[]) {
    const [systemNotificationsEnabled, setSystemNotificationsEnabled] = useState(false);

    try {
      let settings = await Notifications.getPermissionsAsync();

      if (!settings.granted) {
        if (!settings.canAskAgain) {
          Alert.alert(
            'Notificaciones desactivadas',
            'Debes habilitarlas desde la configuración',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Abrir configuración',
                onPress: () => Linking.openSettings(),
              },
            ]
          );
          return;
        }

        settings = await Notifications.requestPermissionsAsync();
        setSystemNotificationsEnabled(settings.granted);

        if (!settings.granted) {
          Alert.alert(
            'Permiso no garantizado',
            'No se otorgaron permisos para notificaciones.'
          );
          return;
        }
      }

      setSystemNotificationsEnabled(true);

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
        });
      }

      for (const [index, notif] of notifications?.entries()) {
          
          let icon = "⚪";

          switch (notif.MediaType) {
              case 1:
                  icon = "📰";
                  break;
              case 2:
                  icon = "📱";
                  break;
              case 3:
                  icon = "🖥️";
                  break;
              case 4:
                  icon = "🎙️";
                  break;
          }

          await Notifications.scheduleNotificationAsync({
              content: {
                  title: 'Test Notification',
                  subtitle: `${icon} ${notif.Media} ${notif.Section}`,
                  body: notif.Title,
                  data: {
                      url: `/news/${notif.NoticiaId}`,
                      params: {
                        id: notif.NoticiaId,
                        consultasId: notif.ConsultasId
                      },
                  },
                  sound: true,
              },
              trigger: {
                  type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                  seconds: index + 1
              },
          });
      }

    } catch (error) {
      console.error('Error al disparar notificación:', error);
    }
}