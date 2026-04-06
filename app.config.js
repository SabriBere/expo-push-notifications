const appJson = require("./app.json");

module.exports = () => {
  const config = appJson.expo;
  const projectId =
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? config.extra?.eas?.projectId;
  const googleServicesFile =
    process.env.GOOGLE_SERVICES_JSON ?? config.android?.googleServicesFile;

  return {
    ...config,
    extra: {
      ...config.extra,
      eas: {
        ...config.extra?.eas,
        ...(projectId ? { projectId } : {}),
      },
    },
    android: {
      ...config.android,
      ...(googleServicesFile ? { googleServicesFile } : {}),
    },
  };
};
