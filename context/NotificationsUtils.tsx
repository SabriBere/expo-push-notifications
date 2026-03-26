import * as Notifications from "expo-notifications";
import { Alert, Linking, Platform } from "react-native";

interface NotificationItem {
  Title: string;
  MediaType: number;
  Media: string;
  Section: string;
  NoticiaId: number;
  ConsultasId: number;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensureNotificationPermissions() {
  let settings = await Notifications.getPermissionsAsync();

  if (!settings.granted) {
    if (!settings.canAskAgain) {
      Alert.alert(
        "Notificaciones desactivadas",
        "Tenés que habilitarlas desde ajustes.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Abrir ajustes", onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }

    settings = await Notifications.requestPermissionsAsync();
    if (!settings.granted) return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return true;
}

export async function triggerPushNotifications(
  notifications: NotificationItem[]
) {
  const hasPermission = await ensureNotificationPermissions();
  if (!hasPermission) return;

  for (const notif of notifications) {
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
      trigger: null,
    });
  }
}