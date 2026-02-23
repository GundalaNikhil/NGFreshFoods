const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8080";
const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION || "v1";

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/${API_VERSION}/onboarding/login`,
  SIGNUP: `${API_BASE_URL}/api/${API_VERSION}/onboarding/register`,
  OTP_SEND: `${API_BASE_URL}/api/${API_VERSION}/onboarding/otp/send`,
  OTP_VERIFY_SIGNUP: `${API_BASE_URL}/api/${API_VERSION}/onboarding/otp/verify-signup`,
  OTP_VERIFY_LOGIN: `${API_BASE_URL}/api/${API_VERSION}/onboarding/otp/verify-login`,
  FIREBASE_SIGNUP_OTP: `${API_BASE_URL}/api/${API_VERSION}/onboarding/firebase/register-otp`,
  FIREBASE_LOGIN_OTP: `${API_BASE_URL}/api/${API_VERSION}/onboarding/firebase/login-otp`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/${API_VERSION}/onboarding/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/${API_VERSION}/onboarding/reset-password`,
};
