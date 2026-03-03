import { ChevronRight } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

const CartFooter = ({ totalPayable, itemCount, onPlaceOrder }) => {
  const [loading, setLoading] = React.useState(false);
  if (itemCount === 0) return null;

  const handlePress = async () => {
    if (onPlaceOrder) {
      setLoading(true);
      try {
        await onPlaceOrder();
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View className="bg-white border-t border-gray-100">
      {/* Main CTA */}
      <View className="px-4 py-4 pb-[80px]">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handlePress}
          disabled={loading}
          className={`rounded-xl h-14 flex-row items-center px-5 justify-between shadow-lg ${
            loading ? "bg-gray-400" : "bg-[#16A34A] shadow-green-200"
          }`}
        >
          <View>
            <Text className="text-white font-black text-[18px]">
              ₹{totalPayable.toFixed(2)}
            </Text>
            <Text className="text-white/80 font-bold text-[10px] uppercase">
              Total Payable
            </Text>
          </View>
          
          <View className="flex-row items-center">
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text className="text-white font-black text-[17px] mr-1 uppercase">
                  Place Order
                </Text>
                <ChevronRight size={20} color="#fff" strokeWidth={4} />
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartFooter;
