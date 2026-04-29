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
          "Request failed",
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

const requireToken = (token) => {
  if (!token) {
    return {
      success: false,
      error: {
        type: "auth_error",
        message: "You need to be logged in to continue.",
        details: null,
      },
    };
  }
  return null;
};

const toUserProfile = (payload) => {
  const firstName = payload?.firstName || "";
  const lastName = payload?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  console.log("[BFF] toUserProfile parsed payload role as:", payload?.role);

  return {
    userId: payload?.userId || "",
    email: payload?.email || "",
    firstName,
    lastName,
    fullName,
    phoneNumber: payload?.phoneNumber || "",
    role: payload?.role || "CUSTOMER",
    isNewUser: payload?.newUser || false,
    addresses: payload?.userAddresses || [],
    addressId: payload?.userAddresses?.[0]?.addressId || null,
  };
};

export const fetchMyProfile = async ({ token }) => {
  const missing = requireToken(token);
  if (missing) return missing;

  try {
    const response = await apiClient.get(API_ENDPOINTS.PROFILE_ME);

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

export const updateMyProfile = async ({ token, firstName, lastName, phoneNumber }) => {
  const missing = requireToken(token);
  if (missing) return missing;

  try {
    const response = await apiClient.put(
      API_ENDPOINTS.PROFILE_UPDATE,
      {
        firstName,
        lastName,
        phoneNumber,
      }
    );

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

export const fetchMyAddresses = async ({ token }) => {
  const missing = requireToken(token);
  if (missing) return missing;

  try {
    const response = await apiClient.get(API_ENDPOINTS.ADDRESSES_ME);

    return {
      success: true,
      data: {
        addresses: response?.data || [],
      },
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const createAddress = async ({ token, payload }) => {
  const missing = requireToken(token);
  if (missing) return missing;

  try {
    const response = await apiClient.post(API_ENDPOINTS.ADDRESSES_ME, payload);

    return {
      success: true,
      data: response?.data || null,
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const updateAddress = async ({ token, addressId, payload }) => {
  const missing = requireToken(token);
  if (missing) return missing;

  try {
    const response = await apiClient.put(
      API_ENDPOINTS.ADDRESS_UPDATE(addressId),
      payload
    );

    return {
      success: true,
      data: response?.data || null,
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const deleteAddress = async ({ token, addressId }) => {
  const missing = requireToken(token);
  if (missing) return missing;

  try {
    await apiClient.delete(API_ENDPOINTS.ADDRESS_DELETE(addressId));
    return { success: true };
  } catch (error) {
    return normalizeError(error);
  }
};

export const fetchMyOrders = async ({ token }) => {
  const missing = requireToken(token);
  if (missing) return missing;

  try {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS_ME);

    return {
      success: true,
      data: {
        orders: response?.data || [],
      },
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const fetchOrderById = async (orderId) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.ORDER_DETAIL(orderId));

    return {
      success: true,
      data: response?.data || null,
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const registerDevicePushToken = async ({ token, payload }) => {
  const missing = requireToken(token);
  if (missing) return missing;

  try {
    const response = await apiClient.post(
      API_ENDPOINTS.NOTIFICATION_REGISTER_DEVICE,
      payload
    );
    return {
      success: true,
      data: response?.data || null,
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const unregisterCurrentDevice = async ({ token }) => {
  const missing = requireToken(token);
  if (missing) return missing;

  try {
    await apiClient.delete(API_ENDPOINTS.NOTIFICATION_UNREGISTER_DEVICE);
    return { success: true };
  } catch (error) {
    return normalizeError(error);
  }
};

export const fetchNotificationPreferences = async ({ token }) => {
  const missing = requireToken(token);
  if (missing) return missing;

  try {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATION_PREFERENCES);
    return {
      success: true,
      data: response?.data || null,
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const updateNotificationPreferences = async ({ token, payload }) => {
  const missing = requireToken(token);
  if (missing) return missing;

  try {
    const response = await apiClient.put(
      API_ENDPOINTS.NOTIFICATION_PREFERENCES,
      payload
    );
    return {
      success: true,
      data: response?.data || null,
    };
  } catch (error) {
    return normalizeError(error);
  }
};

export const fetchNotificationFeed = async ({ token }) => {
  const missing = requireToken(token);
  if (missing) return missing;

  try {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATION_FEED);
    return {
      success: true,
      data: {
        notifications: response?.data || [],
      },
    };
  } catch (error) {
    return normalizeError(error);
  }
};
