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

const NEWS_CATEGORY_ID = "news-actions";
const ACTION_MARK_AS_READ = "mark-as-read";

//crear categoria
export async function registerNotificationActions() {
  await Notifications.setNotificationCategoryAsync(NEWS_CATEGORY_ID, [
    {
      identifier: ACTION_MARK_AS_READ,
      //modificar textos para traducción
      buttonTitle: "Leído",
      options: {
        opensAppToForeground: false,
      },
    },
  ]);
}

//función de marcar como leido
export function listenNotificationActions() {
  return Notifications.addNotificationResponseReceivedListener(async (response) => {
    const actionId = response.actionIdentifier;
    const data = response.notification.request.content.data as {
      url?: string;
      params?: {
        id?: number;
        consultasId?: number;
      };
    };

    // Acción custom: marcar como leído
    if (actionId === ACTION_MARK_AS_READ) {
      const noticiaId = data?.params?.id;
      const consultasId = data?.params?.consultasId;

      console.log("Marcar como leído:", { noticiaId, consultasId });

      // Acá podés:
      // 1) llamar a tu backend
      // 2) actualizar react-query / redux
      // 3) persistir en storage
      return;
    }

    // Tap normal sobre la notificación
    if (actionId === Notifications.DEFAULT_ACTION_IDENTIFIER) {
      console.log("Abrir noticia:", data);
      // Acá navegás con expo-router, por ejemplo
      // router.push({
      //   pathname: `/news/${data?.params?.id}`,
      //   params: { consultasId: String(data?.params?.consultasId) },
      // });
    }
  });
}

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

  await registerNotificationActions();

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
        categoryIdentifier: NEWS_CATEGORY_ID,
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