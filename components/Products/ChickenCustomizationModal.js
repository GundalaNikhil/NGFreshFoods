import { X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const WEIGHT_OPTIONS = [
  { label: "250gms", value: "250gms" },
  { label: "500gms", value: "500gms" },
  { label: "750gms", value: "750gms" },
  { label: "1kg", value: "1kg" },
];

const SKIN_OPTIONS = [
  { label: "Skin", value: "Skin", additionalPrice: 0 },
  { label: "Skinless", value: "Skinless", additionalPrice: 100 },
];

const FLAVOUR_OPTIONS = [
  { label: "Normal", value: "normal", additionalPrice: 0 },
  {
    label: "Smoked & Turmeric",
    value: "Smoked & Turmeric",
    additionalPrice: 10,
  },
];

const CHICKEN_CUT_OPTIONS = [
  { label: "Small", value: "Small Cut Pieces", additionalPrice: 0 },
  { label: "Medium", value: "Medium Cut Pieces", additionalPrice: 0 },
  { label: "Large", value: "Large Cut Pieces", additionalPrice: 0 },
];

const ChickenCustomizationModal = ({
  product,
  visible,
  onClose,
  onAddToCart,
  weightOptions = WEIGHT_OPTIONS,
  skinOptions = SKIN_OPTIONS,
  flavourOptions = FLAVOUR_OPTIONS,
  cutOptions = CHICKEN_CUT_OPTIONS,
  customPriceCalculator = null,
}) => {
  const [selectedWeight, setSelectedWeight] = useState(weightOptions[0]?.value);
  const [selectedSkin, setSelectedSkin] = useState(skinOptions[0]?.value);
  const [selectedFlavour, setSelectedFlavour] = useState(
    flavourOptions[0]?.value
  );
  const [selectedCut, setSelectedCut] = useState(cutOptions[0]?.value);
  const [loading, setLoading] = useState(false);

  const calculateTotalPrice = useMemo(() => {
    if (customPriceCalculator) {
      return customPriceCalculator({
        basePrice: product.base_price,
        weight: selectedWeight,
        skin: selectedSkin,
        flavour: selectedFlavour,
        cut: selectedCut,
      });
    }

    const weightMultipliers = {
      "250gms": 0.25,
      "500gms": 0.5,
      "750gms": 0.75,
      "1kg": 1,
    };

    const weightAdjustedPrice =
      product.base_price * (weightMultipliers[selectedWeight] || 0.25);
    const skinExtra = selectedSkin === "Skinless" ? 100 : 0;
    const flavourExtra = selectedFlavour === "Smoked & Turmeric" ? 10 : 0;

    return weightAdjustedPrice + skinExtra + flavourExtra;
  }, [
    product,
    selectedWeight,
    selectedSkin,
    selectedFlavour,
    selectedCut,
    customPriceCalculator,
  ]);

  const handleAddToCart = async () => {
    setLoading(true);
    const customizedProduct = {
      ...product,
      customizations: {
        netWeight: selectedWeight,
        skinType: selectedSkin,
        flavour: selectedFlavour,
        cutSize: selectedCut,
      },
      base_price: calculateTotalPrice,
    };

    await onAddToCart(customizedProduct);
    setLoading(false);
    onClose();
  };

  const renderOptionButton = (option, isSelected, onSelect, colorScheme) => (
    <TouchableOpacity
      key={option.value}
      onPress={() => onSelect(option.value)}
      className={`border rounded-lg p-3 mb-2 mr-2 ${
        isSelected ? colorScheme.selected : colorScheme.default
      }`}
    >
      <Text
        className={`text-sm font-medium ${
          isSelected ? "text-white" : "text-gray-800"
        }`}
      >
        {option.label}
      </Text>
      {option.additionalPrice > 0 && (
        <Text
          className={`text-xs mt-1 ${
            isSelected ? "text-white/80" : "text-gray-500"
          }`}
        >
          + ₹{option.additionalPrice}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderSection = (
    title,
    options,
    selectedValue,
    onSelect,
    colorScheme
  ) => (
    <View className={`p-4 rounded-xl mb-4 ${colorScheme.container}`}>
      <Text className="text-lg font-semibold text-gray-800 mb-3">{title}</Text>
      <View className="flex-row flex-wrap">
        {options.map((option) =>
          renderOptionButton(
            option,
            selectedValue === option.value,
            onSelect,
            colorScheme
          )
        )}
      </View>
    </View>
  );

  const colorSchemes = {
    weight: {
      container: "bg-rose-50",
      default: "bg-white border-rose-200",
      selected: "bg-rose-600 border-rose-600",
    },
    skin: {
      container: "bg-amber-50",
      default: "bg-white border-amber-200",
      selected: "bg-amber-600 border-amber-600",
    },
    cut: {
      container: "bg-emerald-50",
      default: "bg-white border-emerald-200",
      selected: "bg-emerald-600 border-emerald-600",
    },
    flavour: {
      container: "bg-orange-50",
      default: "bg-white border-orange-200",
      selected: "bg-orange-500 border-orange-500",
    },
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/30">
        <Pressable onPress={onClose} className="flex-1" />

        <View className="bg-white rounded-t-3xl max-h-[90%]">
          <View className="relative p-4 border-b border-gray-100">
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-4 top-4 z-10 bg-gray-100 rounded-full p-2"
            >
              <X size={20} color="#666" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-center text-gray-800">
              Customize {product?.name}
            </Text>
          </View>

          <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
            {renderSection(
              "Net Weight",
              weightOptions,
              selectedWeight,
              setSelectedWeight,
              colorSchemes.weight
            )}
            {renderSection(
              "Type of Meat",
              skinOptions,
              selectedSkin,
              setSelectedSkin,
              colorSchemes.skin
            )}
            {renderSection(
              "Cut Size Pieces",
              cutOptions,
              selectedCut,
              setSelectedCut,
              colorSchemes.cut
            )}
            {renderSection(
              "Flavour",
              flavourOptions,
              selectedFlavour,
              setSelectedFlavour,
              colorSchemes.flavour
            )}
          </ScrollView>

          <View className="p-4 border-t border-gray-100">
            <View className="bg-gray-50 p-4 rounded-xl mb-4">
              <Text className="text-2xl font-bold text-gray-800">
                ₹{calculateTotalPrice.toFixed(2)}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                {selectedWeight} | {selectedCut} | {selectedSkin} |{" "}
                {selectedFlavour}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleAddToCart}
              disabled={loading}
              className="bg-red-600 p-4 rounded-lg flex-row justify-center items-center"
            >
              {loading && <ActivityIndicator color="#fff" size="small" className="mr-2" />}
              <Text className="text-white text-center font-semibold text-lg">
                {loading ? "Adding..." : "Add To Cart"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ChickenCustomizationModal;
