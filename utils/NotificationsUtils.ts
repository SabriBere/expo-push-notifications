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

const DEMO_NOTIFICATION_CATEGORY_ID = "demo-notification-actions";
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

export async function registerNotificationActions() {
  await Notifications.setNotificationCategoryAsync(DEMO_NOTIFICATION_CATEGORY_ID, [
    {
      identifier: ACTION_MARK_AS_READ,
      buttonTitle: "Mark as read",
      options: {
        opensAppToForeground: false,
      },
    },
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

export function listenNotificationActions() {
  return Notifications.addNotificationResponseReceivedListener(async (response) => {
    const actionId = response.actionIdentifier;
    const data = response.notification.request.content.data as DemoNotificationData;
    if (actionId === ACTION_MARK_AS_READ) {
      console.info("Notification marked as read", {
        itemId: data.itemId,
        contextId: data.contextId,
      });
    }
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
        categoryIdentifier: DEMO_NOTIFICATION_CATEGORY_ID,
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
