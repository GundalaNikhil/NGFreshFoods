import { Platform } from 'react-native';
import app from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import Constants from 'expo-constants';

// For native Firebase (@react-native-firebase/*), initialization usually 
// happens automatically via google-services.json or GoogleService-Info.plist.
//
// If you specifically need to pass configuration dynamically from JS
// (e.g. for a secondary app), you can use the credentials defined in app.json extra:
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || Constants.expoConfig?.extra?.firebase?.apiKey,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || Constants.expoConfig?.extra?.firebase?.authDomain,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || Constants.expoConfig?.extra?.firebase?.projectId,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || Constants.expoConfig?.extra?.firebase?.storageBucket,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || Constants.expoConfig?.extra?.firebase?.messagingSenderId,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || Constants.expoConfig?.extra?.firebase?.appId,
};

// Initialize only if no apps are present (fallback for specific setups)
const isConfigMissing = !firebaseConfig.apiKey || firebaseConfig.apiKey === "EXPO_PUBLIC_FIREBASE_API_KEY";

if (!app.apps.length) {
  if (isConfigMissing) {
    console.error(
      "FIREBASE MISSING CREDENTIALS: You must either provide a valid google-services.json AND rebuild, OR create an .env file with EXPO_PUBLIC_FIREBASE_API_KEY and restart the server."
    );
  } else {
    app.initializeApp(firebaseConfig);
  }
}

export { auth };
export default app;
