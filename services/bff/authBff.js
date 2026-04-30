import { API_ENDPOINTS } from "../config/endpoints";
import { apiClient } from "../http/apiClient";

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");
const normalizeEmail = (email) => normalizeText(email).toLowerCase();
const normalizePhone = (phoneNumber) => normalizeText(phoneNumber);

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
    role: payload?.role || "CUSTOMER",
    isNewUser: payload?.newUser || false, // Note: Lombok generates isNewUser() but Jackson serializes boolean isNewUser as 'newUser'
    addresses: payload?.userAddresses || [],
    addressId: payload?.userAddresses?.[0]?.addressId || null,
  };
};

export const loginWithFirebaseOtpBff = async ({ idToken }) => {
  try {
    console.log("SENDING OTP REQUEST TO BASE URL:", API_ENDPOINTS.FIREBASE_LOGIN_OTP);
    const response = await apiClient.post(API_ENDPOINTS.FIREBASE_LOGIN_OTP, {
      idToken: normalizeText(idToken),
    });

    return {
      success: true,
      data: {
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
        profile: toUserProfile(response?.data || {}),
      },
    };
  } catch (error) {
    return normalizeError(error);
  }
};
