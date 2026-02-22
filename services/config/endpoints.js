const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8080";
const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION || "v1";

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/${API_VERSION}/onboarding/login`,
  SIGNUP: `${API_BASE_URL}/api/${API_VERSION}/onboarding/register`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/${API_VERSION}/onboarding/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/${API_VERSION}/onboarding/reset-password`,
};

