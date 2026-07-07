const { version: appVersion } = require("./package.json");

function getAndroidVersionCode(version) {
  const [coreVersion] = version.split("-");
  const [major = 0, minor = 0, patch = 0] = coreVersion
    .split(".")
    .map((value) => Number.parseInt(value, 10) || 0);

  return major * 10000 + minor * 100 + patch;
}

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

module.exports = () => {
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
  const googleServicesFile = process.env.GOOGLE_SERVICES_JSON;
  const expoOwner = requireEnv("EXPO_OWNER");
  const iosBundleIdentifier = requireEnv("IOS_BUNDLE_IDENTIFIER");
  const androidPackage = requireEnv("ANDROID_PACKAGE");

  return {
    name: "TestNotifications",
    slug: "testnotifications",
    owner: expoOwner,
    version: appVersion,
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "testnotifications",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      bundleIdentifier: iosBundleIdentifier,
      supportsTablet: true,
      infoPlist: {
        UIBackgroundModes: ["remote-notification"],
      },
    },
    android: {
      package: androidPackage,
      versionCode: getAndroidVersionCode(appVersion),
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      ...(googleServicesFile ? { googleServicesFile } : {}),
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-web-browser",
      [
        "expo-notifications",
        {
          icon: "./assets/images/android-icon-monochrome.png",
          color: "#ffffff",
          defaultChannel: "default",
        },
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      eas: {
        ...(projectId ? { projectId } : {}),
      },
    },
  };
};
