import { Drumstick, Leaf } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useProducts } from "../../hooks/useProducts";
import { productFoodTypeOptions } from "../../utils/productClassification";

const ProductFilter = () => {
  const {
    categories,
    selectedCategory,
    selectedFoodType,
    setSelectedCategory,
    setSelectedFoodType,
  } = useProducts();

  const foodTypes = [
    { id: productFoodTypeOptions.VEG, label: "Veg", icon: Leaf, activeColor: "#22C55E", activeBg: "#F0FDF4", activeBorder: "#86EFAC" },
    { id: productFoodTypeOptions.NON_VEG, label: "Non-veg", icon: Drumstick, activeColor: "#E23744", activeBg: "#FFF1F2", activeBorder: "#FECDD3" },
  ];

  const handleAllPress = () => {
    setSelectedCategory("ALL");
    setSelectedFoodType(productFoodTypeOptions.ALL);
  };

  const handleFoodTypePress = (foodType) => {
    setSelectedCategory("ALL");
    setSelectedFoodType(foodType);
  };

  const handleCategoryPress = (categoryId) => {
    setSelectedFoodType(productFoodTypeOptions.ALL);
    setSelectedCategory(categoryId);
  };

  const isAllSelected =
    selectedCategory === "ALL" && selectedFoodType === productFoodTypeOptions.ALL;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* All chip */}
        <TouchableOpacity
          onPress={handleAllPress}
          style={[
            styles.chip,
            isAllSelected && styles.chipActiveRed,
          ]}
          activeOpacity={0.8}
        >
          <Text style={[styles.chipText, isAllSelected && styles.chipTextActiveRed]}>
            All
          </Text>
        </TouchableOpacity>

        {/* Food type chips */}
        {foodTypes.map((foodType) => {
          const Icon = foodType.icon;
          const isSelected = selectedFoodType === foodType.id;
          return (
            <TouchableOpacity
              key={foodType.id}
              onPress={() => handleFoodTypePress(foodType.id)}
              style={[
                styles.chip,
                styles.chipWithIcon,
                isSelected && {
                  backgroundColor: foodType.activeBg,
                  borderColor: foodType.activeBorder,
                },
              ]}
              activeOpacity={0.8}
            >
              <Icon size={14} color={isSelected ? foodType.activeColor : "#93959F"} />
              <Text
                style={[
                  styles.chipText,
                  styles.chipTextWithIcon,
                  isSelected && { color: foodType.activeColor },
                ]}
              >
                {foodType.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Category chips */}
        {categories.map((category) => {
          const isSelected = selectedCategory === category.category_id;
          return (
            <TouchableOpacity
              key={category.category_id}
              onPress={() => handleCategoryPress(category.category_id)}
              style={[
                styles.chip,
                isSelected && styles.chipActiveRed,
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActiveRed]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  chipWithIcon: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    gap: 5,
  },
  chipActiveRed: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.1,
  },
  chipTextWithIcon: {
    // inherits from chipText
  },
  chipTextActiveRed: {
    color: '#E23744',
  },
});

export default ProductFilter;
