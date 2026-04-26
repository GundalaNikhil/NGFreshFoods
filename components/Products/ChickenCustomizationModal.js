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
import { calculateUnitPrice } from "../../utils/cartHelper";

/**
 * ChickenCustomizationModal
 *
 * Renders variant/addon options from API data (product.variants, product.addons).
 * No hardcoded arrays — everything comes from the DB.
 *
 * @param {Object}   product      – product with variants[] and addons[] from API
 * @param {boolean}  visible
 * @param {Function} onClose
 * @param {Function} onAddToCart  – called with (product, selectedVariant, selectedAddons)
 */
const ChickenCustomizationModal = ({
  product,
  visible,
  onClose,
  onAddToCart,
}) => {
  const variants = product?.variants || [];
  const addons = product?.addons || [];

  // Group addons by addonGroup
  const addonGroups = useMemo(() => {
    const groups = {};
    addons.forEach((addon) => {
      if (!groups[addon.addonGroup]) {
        groups[addon.addonGroup] = [];
      }
      groups[addon.addonGroup].push(addon);
    });
    return groups;
  }, [addons]);

  // Initialize selections to defaults
  const defaultVariant = variants.find((v) => v.isDefault) || variants[0] || null;
  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);

  // Default addon per group
  const getDefaultAddonSelections = () => {
    const selections = {};
    Object.entries(addonGroups).forEach(([group, options]) => {
      const defaultOpt = options.find((a) => a.isDefault) || options[0];
      if (defaultOpt) selections[group] = defaultOpt;
    });
    return selections;
  };
  const [addonSelections, setAddonSelections] = useState(getDefaultAddonSelections());
  const [loading, setLoading] = useState(false);

  // Reset selections when modal opens with a different product
  React.useEffect(() => {
    if (visible) {
      const defVar = variants.find((v) => v.isDefault) || variants[0] || null;
      setSelectedVariant(defVar);
      setAddonSelections(getDefaultAddonSelections());
    }
  }, [visible, product?.productId]);

  const selectedAddons = Object.values(addonSelections).filter(Boolean);

  const totalPrice = useMemo(() => {
    if (!selectedVariant) return product?.base_price || product?.basePrice || 0;
    return calculateUnitPrice(selectedVariant.price, selectedAddons);
  }, [selectedVariant, selectedAddons, product]);

  const handleAddToCart = async () => {
    setLoading(true);
    await onAddToCart(product, selectedVariant, selectedAddons);
    setLoading(false);
    onClose();
  };

  const handleSelectAddon = (group, addon) => {
    setAddonSelections((prev) => ({ ...prev, [group]: addon }));
  };

  // ── Rendering ──

  const colorSchemes = {
    default: {
      container: "bg-rose-50",
      default: "bg-white border-rose-200",
      selected: "bg-rose-600 border-rose-600",
    },
    SKIN: {
      container: "bg-amber-50",
      default: "bg-white border-amber-200",
      selected: "bg-amber-600 border-amber-600",
    },
    CUT_SIZE: {
      container: "bg-blue-50",
      default: "bg-white border-blue-200",
      selected: "bg-blue-600 border-blue-600",
    },
    FLAVOUR: {
      container: "bg-orange-50",
      default: "bg-white border-orange-200",
      selected: "bg-orange-500 border-orange-500",
    },
  };

  const groupLabels = {
    SKIN: "Type of Meat",
    FLAVOUR: "Flavour",
    CUT_SIZE: "Cut Size Pieces",
  };

  const renderOptionButton = (option, isSelected, onSelect, colorScheme) => (
    <TouchableOpacity
      key={option.variantId || option.addonId}
      onPress={() => onSelect(option)}
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
      {(option.extraPrice > 0) && (
        <Text
          className={`text-xs mt-1 ${
            isSelected ? "text-white/80" : "text-gray-500"
          }`}
        >
          + ₹{option.extraPrice}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderSection = (key, title, options, selectedOption, onSelect, colorScheme) => (
    <View key={key} className={`p-4 rounded-xl mb-4 ${colorScheme.container}`}>
      <Text className="text-lg font-semibold text-gray-800 mb-3">{title}</Text>
      <View className="flex-row flex-wrap">
        {options.map((option) =>
          renderOptionButton(
            option,
            (selectedOption?.variantId || selectedOption?.addonId) ===
              (option.variantId || option.addonId),
            onSelect,
            colorScheme
          )
        )}
      </View>
    </View>
  );

  if (!variants.length && !addons.length) return null;

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
            {/* Variant selection (weight) */}
            {variants.length > 0 &&
              renderSection(
                "variants",
                "Net Weight",
                variants,
                selectedVariant,
                setSelectedVariant,
                colorSchemes.default
              )}

            {/* Addon group selections */}
            {Object.entries(addonGroups).map(([group, options]) =>
              renderSection(
                `addon-${group}`,
                groupLabels[group] || group,
                options,
                addonSelections[group],
                (addon) => handleSelectAddon(group, addon),
                colorSchemes[group] || colorSchemes.default
              )
            )}
          </ScrollView>

          <View className="p-4 border-t border-gray-100">
            <View className="bg-gray-50 p-4 rounded-xl mb-4">
              <Text className="text-2xl font-bold text-gray-800">
                ₹{totalPrice.toFixed(2)}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                {selectedVariant?.label || ""}{" "}
                {selectedAddons
                  .filter((a) => a.extraPrice > 0)
                  .map((a) => `+ ${a.label}`)
                  .join(" ")}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleAddToCart}
              disabled={loading}
              className="bg-[#E23744] p-4 rounded-lg flex-row justify-center items-center"
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
