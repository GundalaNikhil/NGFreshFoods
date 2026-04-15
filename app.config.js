const appJson = require("./app.json");

module.exports = () => {
  const expo = appJson.expo;

  return {
    ...expo,
    ios: {
      ...expo.ios,
      googleServicesFile:
        process.env.GOOGLE_SERVICE_INFO_PLIST || expo.ios.googleServicesFile,
    },
    android: {
      ...expo.android,
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON || expo.android.googleServicesFile,
    },
  };
};
