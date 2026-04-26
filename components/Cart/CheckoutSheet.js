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
  AlertTriangle,
  CheckCircle,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  Truck,
  Wallet,
  X,
  XCircle,
  MapPin,
  ChevronRight,
} from "lucide-react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const CheckoutSheet = ({
  visible,
  onClose,
  onPayOnline,
  onRetry,
  totalPayable,
  itemCount,
  checkoutState,
  error,
  paymentMethod,
  onSelectMethod,
  onReset,
  onViewOrder,
  currentOrder,
  selectedAddress,
  onSelectAddress,
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
  const isCancelled = checkoutState === "CANCELLED";
  const isAwaitingPayment = checkoutState === "AWAITING_PAYMENT";

  // Can close the sheet? — Not during processing
  const canClose = !isProcessing;

  const handleSafeClose = () => {
    if (!canClose) return;
    if (!isSuccess) onReset(); // Don't reset on SUCCESS — preserve order data
    onClose();
  };

  const renderContent = () => {
    // ── Success State ──
    if (isSuccess) {
      const orderNumber = currentOrder?.orderNumber || currentOrder?.orderId?.slice(0, 10) || "";
      const totalPaid = Number(currentOrder?.totalAmount || totalPayable || 0).toFixed(2);
      return (
        <View className="items-center py-10 px-6">
          <View className="w-20 h-20 rounded-full bg-[#FFF0F1] items-center justify-center mb-4">
            <CheckCircle size={44} color="#E23744" strokeWidth={2} />
          </View>
          <Text className="text-2xl font-black text-[#1C1C1C] mb-1">
            Payment Successful! 🎉
          </Text>
          {orderNumber ? (
            <Text className="text-sm text-green-700 font-bold mb-2">
              Order #{orderNumber}
            </Text>
          ) : null}
          <Text className="text-sm text-[#686B78] text-center leading-relaxed mb-2">
            ₹{totalPaid} paid successfully
          </Text>
          <Text className="text-xs text-[#93959F] text-center leading-relaxed mb-6">
            Your order is confirmed and being prepared.{"\n"}
            Taking you to order details...
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="bg-[#F5F5F5] rounded-xl py-4 px-6"
              activeOpacity={0.9}
              onPress={() => {
                onReset();
                onClose();
              }}
            >
              <Text className="text-[#686B78] font-bold text-sm">Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-[#E23744] rounded-xl py-4 px-8 shadow-sm flex-row items-center"
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
      const isTimeoutError = (error || "").includes("timed out");
      const isVerifyError = (error || "").includes("Do NOT retry");

      return (
        <View className="items-center py-10 px-6">
          <View className={`w-20 h-20 rounded-full items-center justify-center mb-5 ${
            isVerifyError ? "bg-amber-50" : "bg-red-50"
          }`}>
            {isVerifyError ? (
              <AlertTriangle size={44} color="#D97706" strokeWidth={2} />
            ) : (
              <XCircle size={44} color="#DC2626" strokeWidth={2} />
            )}
          </View>
          <Text className="text-2xl font-black text-[#1C1C1C] mb-2">
            {isVerifyError ? "Payment Uncertain" : isTimeoutError ? "Connection Timeout" : "Payment Failed"}
          </Text>
          <Text className="text-sm text-[#686B78] text-center leading-relaxed mb-2">
            {error || "Something went wrong. Please try again."}
          </Text>

          {/* Helpful context based on error type */}
          {isTimeoutError && (
            <View className="bg-amber-50 rounded-xl p-3 mb-4 w-full">
              <Text className="text-xs text-amber-700 text-center leading-relaxed">
                💡 Check your internet connection and try again. No charges have been made.
              </Text>
            </View>
          )}
          {isVerifyError && (
            <View className="bg-amber-50 rounded-xl p-3 mb-4 w-full">
              <Text className="text-xs text-amber-700 text-center leading-relaxed font-semibold">
                ⚠️ Your payment may have been deducted. Please check your bank statement or order history before retrying.
              </Text>
            </View>
          )}

          <View className="flex-row gap-3 mt-2">
            <TouchableOpacity
              className="bg-[#F5F5F5] rounded-xl py-4 px-8"
              activeOpacity={0.9}
              onPress={handleSafeClose}
            >
              <Text className="text-[#686B78] font-bold text-sm">
                {isVerifyError ? "Check Orders" : "Cancel"}
              </Text>
            </TouchableOpacity>
            {!isVerifyError && (
              <TouchableOpacity
                className="bg-[#E23744] rounded-xl py-4 px-8 shadow-sm flex-row items-center"
                activeOpacity={0.9}
                onPress={() => {
                  onReset();
                  if (onRetry) {
                    onRetry();
                  } else {
                    onPayOnline();
                  }
                }}
              >
                <RefreshCw size={14} color="#fff" strokeWidth={2.5} />
                <Text className="text-white font-black text-sm ml-1.5">Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    // ── Cancelled State (user dismissed Razorpay) ──
    if (isCancelled) {
      return (
        <View className="items-center py-10 px-6">
          <View className="w-16 h-16 rounded-full bg-[#F5F5F5] items-center justify-center mb-4">
            <X size={32} color="#686B78" strokeWidth={2} />
          </View>
          <Text className="text-xl font-black text-[#1C1C1C] mb-2">
            Payment Cancelled
          </Text>
          <Text className="text-sm text-[#686B78] text-center leading-relaxed mb-6">
            No worries! Your cart is safe. You can try again whenever you're ready.
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="bg-[#F5F5F5] rounded-xl py-4 px-8"
              activeOpacity={0.9}
              onPress={handleSafeClose}
            >
              <Text className="text-[#686B78] font-bold text-sm">Back to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-[#E23744] rounded-xl py-4 px-8 shadow-sm"
              activeOpacity={0.9}
              onPress={() => {
                onReset();
                if (onRetry) {
                  onRetry();
                } else {
                  onPayOnline();
                }
              }}
            >
              <Text className="text-white font-black text-sm">Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // ── Processing State ──
    if (isProcessing) {
      const stageInfo =
        checkoutState === "CREATING_ORDER"
          ? { title: "Creating your order...", subtitle: "Setting up your order with the best prices." }
          : { title: "Verifying payment...", subtitle: "Confirming with your bank. Almost there!" };

      return (
        <View className="items-center py-14 px-6">
          <ActivityIndicator size="large" color="#E23744" />
          <Text className="text-lg font-bold text-[#1C1C1C] mt-5 mb-1">
            {stageInfo.title}
          </Text>
          <Text className="text-sm text-[#686B78] text-center">
            {stageInfo.subtitle}
          </Text>
          <Text className="text-xs text-[#93959F] mt-3 text-center">
            Please don't close the app or press back.
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
            <Text className="text-xl font-black text-[#1C1C1C]">Checkout</Text>
            <Text className="text-xs text-[#686B78] font-medium mt-0.5">
              {itemCount} item{itemCount !== 1 ? "s" : ""} • ₹
              {totalPayable.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-[#F5F5F5] items-center justify-center"
            onPress={handleSafeClose}
          >
            <X size={18} color="#686B78" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View className="h-[1px] bg-[#F5F5F5] mx-5" />

        {/* Delivery Address Section */}
        <View className="px-5 pt-5 pb-2">
          <Text className="text-xs font-black text-[#93959F] uppercase tracking-widest mb-3">
            Delivery Address
          </Text>
          <TouchableOpacity 
            onPress={onSelectAddress}
            className={`flex-row items-center p-4 rounded-2xl border-2 ${
              selectedAddress ? "border-[#E9E9EB] bg-gray-50" : "border-amber-200 bg-amber-50"
            }`}
            activeOpacity={0.8}
          >
            <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${
              selectedAddress ? "bg-white" : "bg-amber-100"
            }`}>
              <MapPin size={20} color={selectedAddress ? "#E23744" : "#D97706"} strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-[#1C1C1C]">
                {selectedAddress ? selectedAddress.label : "Provide Delivery Address"}
              </Text>
              <Text numberOfLines={1} className="text-xs text-[#686B78] mt-0.5 font-medium">
                {selectedAddress 
                  ? selectedAddress.addressLine1
                  : "Tap to add or select an address"}
              </Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Payment Methods */}
        <View className="px-5 pt-5 pb-3">
          <Text className="text-xs font-black text-[#93959F] uppercase tracking-widest mb-4">
            Payment Method
          </Text>

          {/* Online Payment */}
          <TouchableOpacity
            className={`flex-row items-center p-4 rounded-2xl mb-3 border-2 ${
              paymentMethod === "ONLINE"
                ? "border-[#E23744] bg-[#FFF0F1]"
                : "border-[#E9E9EB] bg-white"
            }`}
            activeOpacity={0.8}
            onPress={() => onSelectMethod("ONLINE")}
          >
            <View
              className={`w-11 h-11 rounded-xl items-center justify-center mr-4 ${
                paymentMethod === "ONLINE" ? "bg-[#E23744]/10" : "bg-gray-50"
              }`}
            >
              <Wallet
                size={22}
                color={paymentMethod === "ONLINE" ? "#16A34A" : "#9CA3AF"}
                strokeWidth={2}
              />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-[#1C1C1C]">
                Pay Online
              </Text>
              <Text className="text-xs text-[#686B78] mt-0.5">
                UPI • Cards • Wallets • Net Banking
              </Text>
            </View>
            <View
              className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                paymentMethod === "ONLINE"
                  ? "border-[#E23744]"
                  : "border-[#D5D5D8]"
              }`}
            >
              {paymentMethod === "ONLINE" && (
                <View className="w-2.5 h-2.5 rounded-full bg-[#E23744]" />
              )}
            </View>
          </TouchableOpacity>

          {/* COD */}
          <TouchableOpacity
            className={`flex-row items-center p-4 rounded-2xl border-2 ${
              paymentMethod === "COD"
                ? "border-[#E23744] bg-[#FFF0F1]"
                : "border-[#E9E9EB] bg-white"
            }`}
            activeOpacity={0.8}
            onPress={() => onSelectMethod("COD")}
          >
            <View
              className={`w-11 h-11 rounded-xl items-center justify-center mr-4 ${
                paymentMethod === "COD" ? "bg-[#E23744]/10" : "bg-gray-50"
              }`}
            >
              <Truck
                size={22}
                color={paymentMethod === "COD" ? "#16A34A" : "#9CA3AF"}
                strokeWidth={2}
              />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-[#1C1C1C]">
                Cash on Delivery
              </Text>
              <Text className="text-xs text-[#686B78] mt-0.5">
                Pay when your order arrives
              </Text>
            </View>
            <View
              className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                paymentMethod === "COD"
                  ? "border-[#E23744]"
                  : "border-[#D5D5D8]"
              }`}
            >
              {paymentMethod === "COD" && (
                <View className="w-2.5 h-2.5 rounded-full bg-[#E23744]" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Security Badge */}
        <View className="flex-row items-center justify-center py-3 mx-5 bg-gray-50 rounded-xl mb-4">
          <ShieldCheck size={14} color="#E23744" strokeWidth={2.5} />
          <Text className="text-xs text-[#686B78] font-semibold ml-1.5">
            100% Secure & Encrypted Payment
          </Text>
        </View>

        {/* CTA Button */}
        <View className="px-5 pb-8">
          <TouchableOpacity
            className={`rounded-xl h-14 flex-row items-center justify-between px-5 shadow-lg ${
              isProcessing || !selectedAddress ? "bg-gray-400" : "bg-[#E23744] shadow-[#E23744]/20"
            }`}
            activeOpacity={0.9}
            onPress={onPayOnline}
            disabled={isProcessing || !selectedAddress}
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
        if (canClose) handleSafeClose();
      }}
    >
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <TouchableWithoutFeedback
          onPress={() => {
            if (canClose) handleSafeClose();
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
            <View className="w-10 h-1 rounded-full bg-[#E9E9EB]" />
          </View>

          {renderContent()}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CheckoutSheet;
