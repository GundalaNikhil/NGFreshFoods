const fs = require('fs');
const path = require('path');

const resDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
const stylesPath = path.join(resDir, 'values', 'styles.xml');

if (fs.existsSync(stylesPath)) {
  let xml = fs.readFileSync(stylesPath, 'utf8');
  
  const regex = /<style name="Theme\.App\.SplashScreen" parent="Theme\.SplashScreen">([\s\S]*?)<\/style>/;
  const match = xml.match(regex);
  if (match) {
    let innerItems = match[1];
    // Strip existing lines we want to replace
    innerItems = innerItems.replace(/<item name="android:windowBackground">.*?<\/item>/g, '');
    innerItems = innerItems.replace(/<item name="windowSplashScreenBackground">.*?<\/item>/g, '');
    innerItems = innerItems.replace(/<item name="windowSplashScreenAnimatedIcon">.*?<\/item>/g, '');
    innerItems = innerItems.replace(/<item name="android:windowSplashScreenAnimatedIcon">.*?<\/item>/g, '');
    innerItems = innerItems.replace(/<item name="android:windowIsTranslucent">.*?<\/item>/g, '');
    innerItems = innerItems.replace(/<item name="android:windowDisablePreview">.*?<\/item>/g, '');
    innerItems = innerItems.replace(/<item name="android:windowShowActivitySplashScreen">.*?<\/item>/g, '');
    
    // Inject the magic combination
    const newInnerItems = `
    <item name="android:windowBackground">@drawable/splashscreen_fullscreen</item>
    <item name="windowSplashScreenBackground">@android:color/transparent</item>
    <item name="windowSplashScreenAnimatedIcon">@android:color/transparent</item>
    <item name="android:windowSplashScreenAnimatedIcon">@android:color/transparent</item>
    <item name="android:windowDisablePreview">true</item>
    <item name="android:windowShowActivitySplashScreen">false</item>` + innerItems;
    
    xml = xml.replace(match[0], `<style name="Theme.App.SplashScreen" parent="Theme.SplashScreen">${newInnerItems}</style>`);
    fs.writeFileSync(stylesPath, xml);
    console.log("Fixed styles.xml");
  } else {
    console.log("Could not find Theme.App.SplashScreen in styles.xml");
  }
} else {
  console.log("styles.xml not found");
}

// Also patch values-night/styles.xml if it exists, or just ensure colors are good
