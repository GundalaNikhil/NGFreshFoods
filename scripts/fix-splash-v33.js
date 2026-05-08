const fs = require('fs');
const path = require('path');

const resDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
const stylesPath = path.join(resDir, 'values', 'styles.xml');

if (fs.existsSync(stylesPath)) {
  let xml = fs.readFileSync(stylesPath, 'utf8');
  
  // 1. Remove the invalid attribute from the base styles.xml
  xml = xml.replace(/<item name="android:windowShowActivitySplashScreen">.*?<\/item>/g, '');
  fs.writeFileSync(stylesPath, xml);
  console.log("Removed windowShowActivitySplashScreen from base styles.xml");
  
  // 2. Create values-v33/styles.xml with the attribute
  const v33Dir = path.join(resDir, 'values-v33');
  if (!fs.existsSync(v33Dir)) fs.mkdirSync(v33Dir, { recursive: true });
  
  const v33StylesPath = path.join(v33Dir, 'styles.xml');
  const v33Xml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- On Android 13+, we can completely disable the OS splash screen to prevent the black screen phase -->
    <style name="Theme.App.SplashScreen" parent="Theme.SplashScreen">
        <item name="android:windowBackground">@drawable/splashscreen_fullscreen</item>
        <item name="windowSplashScreenBackground">@android:color/transparent</item>
        <item name="windowSplashScreenAnimatedIcon">@android:color/transparent</item>
        <item name="android:windowSplashScreenAnimatedIcon">@android:color/transparent</item>
        <item name="android:windowDisablePreview">true</item>
        <item name="android:windowShowActivitySplashScreen">false</item>
    </style>
</resources>
`;
  fs.writeFileSync(v33StylesPath, v33Xml);
  console.log("Created values-v33/styles.xml");
} else {
  console.log("styles.xml not found");
}
