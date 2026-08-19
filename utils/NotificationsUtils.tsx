import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { Alert, Linking, Platform } from "react-native";
import type {
  DemoNotification,
  DemoNotificationData,
} from "@/types/demoNotification";

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

async function ensureNotificationPermissions() {
  let settings = await Notifications.getPermissionsAsync();

  if (!settings.granted) {
    if (!settings.canAskAgain) {
      Alert.alert(
        "Notifications disabled",
        "You need to enable them from settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open settings", onPress: () => Linking.openSettings() },
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

//crear categoria
export async function registerNotificationActions() {
  await Notifications.setNotificationCategoryAsync(NEWS_CATEGORY_ID, [
    {
      identifier: ACTION_MARK_AS_READ,
      buttonTitle: "Marcar como leído",
      options: {
        opensAppToForeground: false,
      },
    },
    // {
    //   identifier: "open-news",
    //   buttonTitle: "Abrir noticia",
    //   options: {
    //     opensAppToForeground: true,
    //   },
    // },
  ]);
}

function getExpoProjectId() {
  const projectId =
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId ??
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

  if (!projectId) {
    throw new Error(
      "Missing EAS projectId. Configure EXPO_PUBLIC_EAS_PROJECT_ID or extra.eas.projectId."
    );
  }

  return projectId;
}

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.warn("Expo push notifications require a physical device.");
    return null;
  }

  const hasPermission = await ensureNotificationPermissions();
  if (!hasPermission) return null;

  await registerNotificationActions();

  const projectId = getExpoProjectId();
  const token = await Notifications.getExpoPushTokenAsync({ projectId });

  return token.data;
}

//función de marcar como leido
export function listenNotificationActions() {
  return Notifications.addNotificationResponseReceivedListener(async (response) => {
    const actionId = response.actionIdentifier;
    const data = response.notification.request.content.data as DemoNotificationData;
    console.log("JSON recibido en la notificación:", JSON.stringify(data, null, 2));
    const url = data.url ?? `/demo-items/${data.itemId}`;

    // Acción custom: marcar como leído
    if (actionId === ACTION_MARK_AS_READ) {
      console.log("Marcar como leído:", {
        itemId: data.itemId,
        contextId: data.contextId,
      });

      // Acá podés:
      // 1) llamar a tu backend
      // 2) actualizar react-query / redux
      // 3) persistir en storage
      return;
    }

    // Tap normal sobre la notificación
    // if (actionId === Notifications.DEFAULT_ACTION_IDENTIFIER) {
    //   console.log("Abrir noticia:", data);
    //   router.push({
    //     pathname: url,
    //     params: {
    //       consultasId: consultasId,
    //     },
    //   })
    // }
  });
}

export async function triggerPushNotifications(
  notifications: DemoNotification[]
) {
  const hasPermission = await ensureNotificationPermissions();
  if (!hasPermission) return;

  await registerNotificationActions();

  for (const notif of notifications) {
    let icon = "⚪";

    switch (notif.sourceType) {
      case "web":
        icon = "🌐";
        break;
      case "system":
        icon = "⚙️";
        break;
      case "email":
        icon = "✉️";
        break;
      case "collaboration":
        icon = "👥";
        break;
    }

    const url = `/demo-items/${notif.itemId}`;
    const notificationDetails = [
      notif.title,
      `Item: ${notif.itemId}`,
      `Context: ${notif.contextId}`,
      `URL: ${url}`,
    ].join("\n");

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${icon} ${notif.source}`,
        subtitle: `${icon} ${notif.source} ${notif.category}`,
        body: notificationDetails,
        categoryIdentifier: NEWS_CATEGORY_ID,
        data: {
          url,
          itemId: notif.itemId,
          contextId: notif.contextId,
        },
        sound: true,
      },
      trigger: null,
    });
  }
}
