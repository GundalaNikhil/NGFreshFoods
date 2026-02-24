import Toast from 'react-native-toast-message';

/**
 * Global Error Handler Middleware for Frontend
 * Intercepts Firebase, Axios API, and generic JS errors
 * and formats them into a user-friendly Toast message.
 */
export const handleGlobalError = (error, context = "App") => {
  // Always safely log the real error for developers
  console.log(`[${context} Error]:`, error);
  
  let userFriendlyMessage = "An unexpected error occurred. Please try again.";
  
  // 1. Intercept Firebase Auth Errors
  if (error.code && error.code.startsWith('auth/')) {
    switch (error.code) {
      case 'auth/invalid-phone-number':
        userFriendlyMessage = "The phone number entered is invalid.";
        break;
      case 'auth/missing-client-identifier':
        userFriendlyMessage = "Play Integrity failed. Please use a whitelisted Test Phone Number on emulators.";
        break;
      case 'auth/too-many-requests':
        userFriendlyMessage = "Too many attempts. Please wait a moment and try again.";
        break;
      case 'auth/invalid-verification-code':
        userFriendlyMessage = "The OTP entered is incorrect. Please try again.";
        break;
      case 'auth/network-request-failed':
        userFriendlyMessage = "Network error. Please check your internet connection.";
        break;
      case 'auth/billing-not-enabled':
        userFriendlyMessage = "Firebase Auth billing issue. Administrator intervention required.";
        break;
      default:
        userFriendlyMessage = error.message || userFriendlyMessage;
    }
  } 
  // 2. Intercept Axios/Backend API Errors
  else if (error.response) {
    userFriendlyMessage = error.response.data?.message || `Server Error: ${error.response.status}`;
  } 
  // 3. Fallback for generic Javascript Errors
  else if (error.message) {
    userFriendlyMessage = error.message;
  }

  // Fire the Global UI Toast
  Toast.show({
    type: 'error',
    text1: 'Oops! Something went wrong.',
    text2: userFriendlyMessage,
    position: 'top',
    visibilityTime: 4000,
    topOffset: 60,
  });
  
  return userFriendlyMessage;
};
