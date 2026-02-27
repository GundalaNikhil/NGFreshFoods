import { API_ENDPOINTS } from "../config/endpoints";
import { apiClient } from "../http/apiClient";

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");
const normalizeEmail = (email) => normalizeText(email).toLowerCase();
const normalizePhone = (phoneNumber) => normalizeText(phoneNumber);
const normalizeOtp = (otp) => normalizeText(otp);

const normalizeError = (error) => {
  if (error.response) {
    return {
      success: false,
      error: {
        type: "server_error",
        message:
          error.response?.data?.customMessage ||
          error.response?.data?.message ||
          "Authentication failed",
        details: error.response.data,
      },
    };
  }

  if (error.request) {
    return {
      success: false,
      error: {
        type: "network_error",
        message:
          "Unable to connect to server. Please check your internet connection.",
        details: error.request,
      },
    };
  }

  return {
    success: false,
    error: {
      type: "request_error",
      message: error.message || "Something went wrong. Please try again.",
      details: null,
    },
  };
};

const toUserProfile = (payload) => {
  const firstName = payload?.firstName || "";
  const lastName = payload?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    userId: payload?.userId || "",
    email: payload?.email || "",
    firstName,
    lastName,
    fullName,
    phoneNumber: payload?.phoneNumber || "",
    isNewUser: payload?.newUser || false, // Note: Lombok generates isNewUser() but Jackson serializes boolean isNewUser as 'newUser'
    addresses: payload?.userAddresses || [],
    addressId: payload?.userAddresses?.[0]?.addressId || null,
  };
};

export const loginWithBff = async ({ email, password }) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, {
      email: normalizeEmail(email),
      password: normalizeText(password),
    });

    return {
      success: true,
      data: {
        token: response?.data?.jwtToken || null,
        profile: toUserProfile(response?.data || {}),
      },
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const signupWithBff = async ({
  firstName,
  lastName,
  email,
  password,
  phoneNumber,
}) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.SIGNUP, {
      firstName: normalizeText(firstName),
      lastName: normalizeText(lastName),
      email: normalizeEmail(email),
      password: normalizeText(password),
      phoneNumber: normalizePhone(phoneNumber),
    });

    return {
      success: true,
      data: {
        token: response?.data?.jwtToken || null,
        profile: toUserProfile(response?.data || {}),
      },
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const sendOtpWithBff = async ({ phoneNumber, purpose }) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.OTP_SEND, {
      phoneNumber: normalizePhone(phoneNumber),
      purpose: normalizeText(purpose),
    });

    return {
      success: true,
      data: {
        message: response?.data?.message || "OTP sent successfully",
        expiresAt: response?.data?.expiresAt || null,
        devOtp: response?.data?.devOtp || null,
      },
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const verifySignupOtpAndRegisterWithBff = async ({
  firstName,
  lastName,
  email,
  password,
  phoneNumber,
  otp,
}) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.OTP_VERIFY_SIGNUP, {
      firstName: normalizeText(firstName),
      lastName: normalizeText(lastName),
      email: normalizeEmail(email),
      password: normalizeText(password),
      phoneNumber: normalizePhone(phoneNumber),
      otp: normalizeOtp(otp),
    });

    return {
      success: true,
      data: {
        token: response?.data?.jwtToken || null,
        profile: toUserProfile(response?.data || {}),
      },
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const loginWithOtpBff = async ({ phoneNumber, otp }) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.OTP_VERIFY_LOGIN, {
      phoneNumber: normalizePhone(phoneNumber),
      otp: normalizeOtp(otp),
    });

    return {
      success: true,
      data: {
        token: response?.data?.jwtToken || null,
        profile: toUserProfile(response?.data || {}),
      },
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const loginWithFirebaseOtpBff = async ({ idToken }) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.FIREBASE_LOGIN_OTP, {
      idToken: normalizeText(idToken),
    });

    return {
      success: true,
      data: {
        token: response?.data?.jwtToken || null,
        profile: toUserProfile(response?.data || {}),
      },
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const signupWithFirebaseOtpBff = async ({
  idToken,
  firstName,
  lastName,
  email,
  password,
  phoneNumber,
}) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.FIREBASE_SIGNUP_OTP, {
      idToken: normalizeText(idToken),
      firstName: normalizeText(firstName),
      lastName: normalizeText(lastName),
      email: normalizeEmail(email),
      password: normalizeText(password),
      phoneNumber: normalizePhone(phoneNumber),
    });

    return {
      success: true,
      data: {
        token: response?.data?.jwtToken || null,
        profile: toUserProfile(response?.data || {}),
      },
    };
  } catch (error) {
    return normalizeError(error);
  }
};
