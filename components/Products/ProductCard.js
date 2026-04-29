import { Minus, Plus } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import CachedImage from "../ResuableComponents/CachedImage";
import { isVegProduct } from "../../utils/productClassification";
import ChickenCustomizationModal from "./ChickenCustomizationModal";

const PLACEHOLDER_IMAGE = "https://res.cloudinary.com/djv3mrzk2/image/upload/v1733513962/ffw/Fresh%20Whole%20Chicken/ri4imwvokptjrw6hcqpq.jpg";

const ProductCard = ({ product, cartItem, addToCart, updateQuantity, onAddToCart }) => {
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const isVeg = isVegProduct(product);

  // Stock awareness
  const stockQty = product.stockQuantity ?? product.stock_quantity ?? 999;
  const isOutOfStock = stockQty <= 0;
  const isLowStock = stockQty > 0 && stockQty <= 5;
  
  const hasCustomizations =
    (product.variants && product.variants.length > 0) ||
    (product.addons && product.addons.length > 0);

  const handleAddToCartClick = () => {
    if (hasCustomizations) {
      setQuantityModalVisible(true);
    } else {
      setIsAdding(true);
      addToCart(product, null, []);
      globalThis.setTimeout(() => {
        setIsAdding(false);
      }, 150);
    }
  };

  const handleUpdateQuantity = (newQty) => {
    if (!cartItem) return;
    setIsAdding(true);
    updateQuantity(cartItem.cartKey, newQty);
    globalThis.setTimeout(() => {
      setIsAdding(false);
    }, 120);
  };

  const handleCustomizedAddToCart = (prod, selectedVariant, selectedAddons) => {
    addToCart(prod, selectedVariant, selectedAddons);
    setQuantityModalVisible(false);
  };

  return (
    <View className="bg-white border-b border-gray-100 p-4" style={{ opacity: isOutOfStock ? 0.55 : 1 }}>
      <View className="flex-row">
        {/* Left Info Section */}
        <View className="flex-1 pr-4">
          <View className="flex-row items-center mb-1">
            <View className={`w-4 h-4 border ${isVeg ? 'border-green-600' : 'border-red-600'} items-center justify-center mr-2`}>
              <View className={`w-2 h-2 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
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

          {/* Out of Stock / Low Stock Badge */}
          {isOutOfStock && (
            <View className="bg-red-50 rounded-md px-2 py-1 mt-2 self-start">
              <Text className="text-[11px] font-bold text-red-600">Out of stock</Text>
            </View>
          )}
          {isLowStock && (
            <View className="rounded-md px-2 py-1 mt-2 self-start" style={{ backgroundColor: "#FFF7ED" }}>
              <Text className="text-[11px] font-bold" style={{ color: "#C2410C" }}>Only {stockQty} left!</Text>
            </View>
          )}
        </View>

        {/* Right Image Section */}
        <View className="items-center">
          <View className="relative">
            <CachedImage
              source={product}
              fallbackUrl={PLACEHOLDER_IMAGE}
              style={{ width: 128, height: 128, borderRadius: 12, backgroundColor: "#f3f4f6" }}
              onError={(event) =>
                console.log(
                  "[ImageError][ProductCard]",
                  product?.name,
                  event?.nativeEvent?.error
                )
              }
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
                  onPress={isOutOfStock ? null : handleAddToCartClick}
                  className="w-full h-full items-center justify-center px-6"
                  activeOpacity={0.8}
                  disabled={isAdding || isOutOfStock}
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
            <Text className="text-[10px] text-gray-500 mt-4 text-center font-bold uppercase tracking-tighter">
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

export default React.memo(ProductCard);
