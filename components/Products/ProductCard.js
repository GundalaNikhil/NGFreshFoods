import { Minus, Plus, ShoppingCart } from "lucide-react-native";
import React, { useState, useMemo } from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import { useCart } from "../../hooks/useCart";
import ChickenCustomizationModal from "./ChickenCustomizationModal";

const ProductCard = ({ product, onAddToCart }) => {
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const { cart, addToCart, updateQuantity } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const productId = product.productId || product.id;
  
  // Find if this specific BASE product is in cart (for non-customizable items)
  const cartItem = useMemo(() => {
    return cart.find(item => item.productId === productId && !item.variantId);
  }, [cart, productId]);

  const discountPercentage = Math.round(
    ((product.mrp - product.base_price) / product.mrp) * 100
  );

  const hasCustomizations =
    (product.variants && product.variants.length > 0) ||
    (product.addons && product.addons.length > 0);

  const handleAddToCartClick = () => {
    if (hasCustomizations) {
      setQuantityModalVisible(true);
    } else {
      setIsAdding(true);
      // Simulate/Ensure visual feedback
      setTimeout(() => {
        addToCart(product, null, []);
        setIsAdding(false);
      }, 500);
    }
  };

  const handleUpdateQuantity = (newQty) => {
    if (!cartItem) return;
    setIsAdding(true);
    setTimeout(() => {
      updateQuantity(cartItem.cartKey, newQty);
      setIsAdding(false);
    }, 400);
  };

  const handleCustomizedAddToCart = (prod, selectedVariant, selectedAddons) => {
    addToCart(prod, selectedVariant, selectedAddons);
    setQuantityModalVisible(false);
  };

  return (
    <View className="bg-white border-b border-gray-100 p-4">
      <View className="flex-row">
        {/* Left Info Section */}
        <View className="flex-1 pr-4">
          <View className="flex-row items-center mb-1">
            <View className="w-4 h-4 border border-green-600 items-center justify-center mr-2">
              <View className="w-2 h-2 rounded-full bg-green-600" />
            </View>
            {product.tags?.[0] && (
              <Text className="text-[11px] font-bold text-orange-500 uppercase">
                {product.tags[0]}
              </Text>
            )}
          </View>
          
          <Text className="text-[17px] font-bold text-gray-900 leading-tight">
            {product.name}
          </Text>
          
          <View className="flex-row items-center mt-1.5">
            <Text className="text-[15px] font-bold text-gray-900">₹{product.base_price}</Text>
            <Text className="text-[13px] text-gray-500 line-through ml-2">₹{product.mrp}</Text>
          </View>

          <Text className="text-[12px] text-gray-500 mt-1 font-medium italic">
            {product.unit}
          </Text>

          <Text className="text-[13px] text-gray-500 mt-2 leading-relaxed" numberOfLines={2}>
            {product.description}
          </Text>
        </View>

        {/* Right Image Section */}
        <View className="items-center">
          <View className="relative">
            <Image
              source={{ uri: product.image_url }}
              className="w-32 h-32 rounded-xl"
              resizeMode="cover"
            />
            
            {/* Swiggy-style ADD/Stepper Button */}
            <View className="absolute -bottom-3 self-center bg-white border border-rose-100 rounded-lg shadow-md shadow-rose-200/50 min-w-[90px] h-9 items-center justify-center">
              {cartItem && !hasCustomizations ? (
                <View className="flex-row items-center justify-between w-full px-2">
                  <TouchableOpacity 
                    onPress={() => handleUpdateQuantity(cartItem.quantity - 1)}
                    className="w-7 h-7 items-center justify-center"
                    disabled={isAdding}
                  >
                    <Minus size={14} color="#E23744" strokeWidth={3} />
                  </TouchableOpacity>
                  
                  {isAdding ? (
                    <ActivityIndicator size="small" color="#E23744" />
                  ) : (
                    <Text className="text-[14px] font-black text-rose-600">
                      {cartItem.quantity}
                    </Text>
                  )}
                  
                  <TouchableOpacity 
                    onPress={() => handleUpdateQuantity(cartItem.quantity + 1)}
                    className="w-7 h-7 items-center justify-center"
                    disabled={isAdding}
                  >
                    <Plus size={14} color="#E23744" strokeWidth={3} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleAddToCartClick}
                  className="w-full h-full items-center justify-center px-6"
                  activeOpacity={0.8}
                  disabled={isAdding}
                >
                  {isAdding ? (
                    <ActivityIndicator size="small" color="#E23744" />
                  ) : (
                    <>
                      <Text className="text-rose-600 font-extrabold text-[14px] tracking-tight">ADD</Text>
                      <View className="absolute top-1 right-2">
                        <Text className="text-[10px] text-rose-600 font-black">+</Text>
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
          {hasCustomizations && (
            <Text className="text-[10px] text-gray-400 mt-4 text-center font-bold uppercase tracking-tighter">
              Customizable
            </Text>
          )}
        </View>
      </View>

      {/* Customization Modal */}
      {hasCustomizations && (
        <ChickenCustomizationModal
          visible={quantityModalVisible}
          product={product}
          onClose={() => setQuantityModalVisible(false)}
          onAddToCart={handleCustomizedAddToCart}
        />
      )}
    </View>
  );
};

export default ProductCard;
