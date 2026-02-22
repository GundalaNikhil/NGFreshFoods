import { API_ENDPOINTS } from "../config/endpoints";
import { apiClient } from "../http/apiClient";

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
    addresses: payload?.userAddresses || [],
    addressId: payload?.userAddresses?.[0]?.addressId || null,
  };
};

export const loginWithBff = async ({ email, password }) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, {
      email,
      password,
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
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
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

