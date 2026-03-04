import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  CheckCircle,
  CreditCard,
  ShieldCheck,
  Truck,
  Wallet,
  X,
  XCircle,
} from "lucide-react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const CheckoutSheet = ({
  visible,
  onClose,
  onPayOnline,
  totalPayable,
  itemCount,
  checkoutState,
  error,
  paymentMethod,
  onSelectMethod,
  onReset,
  onViewOrder,
  currentOrder,
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim]);

  const isProcessing =
    checkoutState === "CREATING_ORDER" || checkoutState === "VERIFYING";
  const isSuccess = checkoutState === "SUCCESS";
  const isFailed = checkoutState === "FAILED";

  const renderContent = () => {
    // ── Success State ──
    if (isSuccess) {
      const orderNumber = currentOrder?.orderNumber || currentOrder?.orderId?.slice(0, 10) || "";
      const totalPaid = Number(currentOrder?.totalAmount || totalPayable || 0).toFixed(2);
      return (
        <View className="items-center py-10 px-6">
          <View className="w-20 h-20 rounded-full bg-green-50 items-center justify-center mb-4">
            <CheckCircle size={44} color="#16A34A" strokeWidth={2} />
          </View>
          <Text className="text-2xl font-black text-gray-900 mb-1">
            Payment Successful! 🎉
          </Text>
          {orderNumber ? (
            <Text className="text-sm text-green-700 font-bold mb-2">
              Order #{orderNumber}
            </Text>
          ) : null}
          <Text className="text-sm text-gray-500 text-center leading-relaxed mb-2">
            ₹{totalPaid} paid successfully
          </Text>
          <Text className="text-xs text-gray-400 text-center leading-relaxed mb-6">
            Your order is confirmed and being prepared.{"\n"}
            Taking you to order details...
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="bg-gray-100 rounded-xl py-4 px-6"
              activeOpacity={0.9}
              onPress={() => {
                onReset();
                onClose();
              }}
            >
              <Text className="text-gray-700 font-bold text-sm">Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-green-600 rounded-xl py-4 px-8 shadow-sm flex-row items-center"
              activeOpacity={0.9}
              onPress={() => {
                if (onViewOrder && currentOrder) {
                  onViewOrder(currentOrder);
                } else {
                  onReset();
                  onClose();
                }
              }}
            >
              <Text className="text-white font-black text-sm mr-1">View Order</Text>
              <Truck size={16} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // ── Failed State ──
    if (isFailed) {
      return (
        <View className="items-center py-10 px-6">
          <View className="w-20 h-20 rounded-full bg-red-50 items-center justify-center mb-5">
            <XCircle size={44} color="#DC2626" strokeWidth={2} />
          </View>
          <Text className="text-2xl font-black text-gray-900 mb-2">
            Payment Failed
          </Text>
          <Text className="text-sm text-gray-500 text-center leading-relaxed mb-8">
            {error || "Something went wrong. Please try again."}
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="bg-gray-100 rounded-xl py-4 px-8"
              activeOpacity={0.9}
              onPress={() => {
                onReset();
                onClose();
              }}
            >
              <Text className="text-gray-700 font-bold text-sm">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-green-600 rounded-xl py-4 px-8 shadow-sm"
              activeOpacity={0.9}
              onPress={() => {
                onReset();
                onPayOnline();
              }}
            >
              <Text className="text-white font-black text-sm">Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // ── Processing State ──
    if (isProcessing) {
      return (
        <View className="items-center py-14 px-6">
          <ActivityIndicator size="large" color="#16A34A" />
          <Text className="text-lg font-bold text-gray-900 mt-5 mb-1">
            {checkoutState === "CREATING_ORDER"
              ? "Creating your order..."
              : "Verifying payment..."}
          </Text>
          <Text className="text-sm text-gray-500 text-center">
            Please wait, do not close the app.
          </Text>
        </View>
      );
    }

    // ── Normal Checkout State ──
    return (
      <>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
          <View>
            <Text className="text-xl font-black text-gray-900">Checkout</Text>
            <Text className="text-xs text-gray-500 font-medium mt-0.5">
              {itemCount} item{itemCount !== 1 ? "s" : ""} • ₹
              {totalPayable.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
            onPress={onClose}
          >
            <X size={18} color="#6B7280" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View className="h-[1px] bg-gray-100 mx-5" />

        {/* Payment Methods */}
        <View className="px-5 pt-5 pb-3">
          <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
            Payment Method
          </Text>

          {/* Online Payment */}
          <TouchableOpacity
            className={`flex-row items-center p-4 rounded-2xl mb-3 border-2 ${
              paymentMethod === "ONLINE"
                ? "border-green-500 bg-green-50"
                : "border-gray-100 bg-white"
            }`}
            activeOpacity={0.8}
            onPress={() => onSelectMethod("ONLINE")}
          >
            <View
              className={`w-11 h-11 rounded-xl items-center justify-center mr-4 ${
                paymentMethod === "ONLINE" ? "bg-green-100" : "bg-gray-50"
              }`}
            >
              <Wallet
                size={22}
                color={paymentMethod === "ONLINE" ? "#16A34A" : "#9CA3AF"}
                strokeWidth={2}
              />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-gray-900">
                Pay Online
              </Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                UPI • Cards • Wallets • Net Banking
              </Text>
            </View>
            <View
              className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                paymentMethod === "ONLINE"
                  ? "border-green-500"
                  : "border-gray-300"
              }`}
            >
              {paymentMethod === "ONLINE" && (
                <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
              )}
            </View>
          </TouchableOpacity>

          {/* COD */}
          <TouchableOpacity
            className={`flex-row items-center p-4 rounded-2xl border-2 ${
              paymentMethod === "COD"
                ? "border-green-500 bg-green-50"
                : "border-gray-100 bg-white"
            }`}
            activeOpacity={0.8}
            onPress={() => onSelectMethod("COD")}
          >
            <View
              className={`w-11 h-11 rounded-xl items-center justify-center mr-4 ${
                paymentMethod === "COD" ? "bg-green-100" : "bg-gray-50"
              }`}
            >
              <Truck
                size={22}
                color={paymentMethod === "COD" ? "#16A34A" : "#9CA3AF"}
                strokeWidth={2}
              />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-gray-900">
                Cash on Delivery
              </Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                Pay when your order arrives
              </Text>
            </View>
            <View
              className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                paymentMethod === "COD"
                  ? "border-green-500"
                  : "border-gray-300"
              }`}
            >
              {paymentMethod === "COD" && (
                <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Security Badge */}
        <View className="flex-row items-center justify-center py-3 mx-5 bg-gray-50 rounded-xl mb-4">
          <ShieldCheck size={14} color="#16A34A" strokeWidth={2.5} />
          <Text className="text-xs text-gray-500 font-semibold ml-1.5">
            100% Secure & Encrypted Payment
          </Text>
        </View>

        {/* CTA Button */}
        <View className="px-5 pb-8">
          <TouchableOpacity
            className={`rounded-xl h-14 flex-row items-center justify-between px-5 shadow-lg ${
              isProcessing ? "bg-gray-400" : "bg-[#16A34A] shadow-green-200"
            }`}
            activeOpacity={0.9}
            onPress={onPayOnline}
            disabled={isProcessing}
          >
            <View>
              <Text className="text-white font-black text-lg">
                ₹{totalPayable.toFixed(2)}
              </Text>
              <Text className="text-white/80 font-bold text-[10px] uppercase">
                Total Payable
              </Text>
            </View>
            <View className="flex-row items-center">
              {isProcessing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text className="text-white font-black text-[16px] mr-1 uppercase">
                    {paymentMethod === "COD" ? "Place Order" : "Pay Now"}
                  </Text>
                  <CreditCard size={18} color="#fff" strokeWidth={2.5} />
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {
        if (!isProcessing) {
          onReset();
          onClose();
        }
      }}
    >
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <TouchableWithoutFeedback
          onPress={() => {
            if (!isProcessing) {
              onReset();
              onClose();
            }
          }}
        >
          <Animated.View
            className="absolute inset-0 bg-black"
            style={{ opacity: Animated.multiply(backdropAnim, 0.5) }}
          />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <Animated.View
          className="bg-white rounded-t-3xl"
          style={{ transform: [{ translateY: slideAnim }] }}
        >
          {/* Handle */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-gray-200" />
          </View>

          {renderContent()}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CheckoutSheet;
