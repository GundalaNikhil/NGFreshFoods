const { withDangerousMod, withAndroidStyles, withAndroidManifest } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Helper to add our custom FullScreenSplash theme to styles.xml
 */
const withSplashStyles = (config) => {
  return withAndroidStyles(config, (config) => {
    const resources = config.modResults.resources;
    if (resources && resources.style) {
      // Create our new custom theme
      const fullScreenTheme = {
        $: {
          name: "Theme.App.FullScreenSplash",
          parent: "Theme.SplashScreen",
        },
        item: [
          { $: { name: "windowSplashScreenAnimatedIcon" }, _: "@android:color/transparent" },
          { $: { name: "android:windowBackground" }, _: "@drawable/splashscreen_fullscreen" },
          { $: { name: "android:windowIsTranslucent" }, _: "true" },
          { $: { name: "windowSplashScreenBackground" }, _: "@color/splashscreen_background" },
          { $: { name: "postSplashScreenTheme" }, _: "@style/AppTheme" },
        ],
      };

      // Add it to the styles array if not already there
      const existingIndex = resources.style.findIndex(s => s.$.name === fullScreenTheme.$.name);
      if (existingIndex > -1) {
        resources.style[existingIndex] = fullScreenTheme;
      } else {
        resources.style.push(fullScreenTheme);
      }
    }
    return config;
  });
};

/**
 * Helper to update AndroidManifest.xml to use our new theme
 */
const withSplashManifest = (config) => {
  return withAndroidManifest(config, (config) => {
    const mainActivity = config.modResults.manifest.application[0].activity.find(
      (a) => a.$["android:name"] === ".MainActivity"
    );
    if (mainActivity) {
      mainActivity.$["android:theme"] = "@style/Theme.App.FullScreenSplash";
    }
    return config;
  });
};

/**
 * Main plugin
 */
module.exports = function withFullScreenSplash(config) {
  // 1. Add the custom theme
  config = withSplashStyles(config);
  
  // 2. Point the Manifest to our custom theme
  config = withSplashManifest(config);

  // 3. Create the drawable
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.platformProjectRoot;
      
      // Create the full screen drawable
      const drawablePath = path.join(
        projectRoot,
        "app/src/main/res/drawable/splashscreen_fullscreen.xml"
      );
      
      const drawableDir = path.dirname(drawablePath);
      if (!fs.existsSync(drawableDir)) {
        fs.mkdirSync(drawableDir, { recursive: true });
      }

      const drawableContent = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splashscreen_background"/>
    <item>
        <bitmap
            android:gravity="fill"
            android:src="@drawable/splashscreen_logo"/>
    </item>
</layer-list>`;
      
      fs.writeFileSync(drawablePath, drawableContent);
      
      return config;
    },
  ]);
};




