import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  TextInput,
  Alert,
  Switch,
  Platform,
  StatusBar,
} from "react-native";
import Reanimated, {
  FadeInDown,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import {
  Search,
  X,
  Plus,
  Package,
  Minus,
  Pencil,
  Trash2,
} from "lucide-react-native";
import {
  fetchAllProducts,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
} from "../../services/bff/adminBff";
import { ListSkeleton } from "./shared/SkeletonLoader";
import EmptyState from "./shared/EmptyState";
import FormModal, { FormField, FormInput } from "./shared/FormModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 0;

// ── Product Form (used in modal) ──
const EMPTY_FORM = {
  name: "",
  description: "",
  imageUrl: "",
  basePrice: "",
  mrp: "",
  stockQuantity: "",
  unit: "500g",
  categoryId: "",
  isActive: true,
};

const PRESET_UNITS = ["250g", "500g", "1kg", "1pc", "6pcs", "12pcs", "1L", "500ml"];

// Allowed suffixes for custom units (prevents SQL injection / invalid data)
const VALID_UNIT_SUFFIXES = ["g", "kg", "pcs", "pc", "ml", "l", "oz", "lb", "dozen", "pack", "box", "bundle"];

/** Sanitize unit input: strip special chars, only allow alphanumeric + period/space */
const sanitizeUnit = (raw) => {
  // Remove anything that's not a letter, digit, space, or period
  return raw.replace(/[^a-zA-Z0-9. ]/g, "").slice(0, 20);
};

/** Validate a custom unit string */
const isValidUnit = (value) => {
  if (!value || !value.trim()) return false;
  // Strictly match digits (with optional decimal), optional space, and a valid suffix
  const regex = /^[\d.]+\s*(g|kg|pcs|pc|ml|l|oz|lb|dozen|pack|box|bundle)$/i;
  return regex.test(value.trim());
};

// ── Product Card ──
const ProductCard = ({ product, onEdit, onStockUpdate, onToggleActive, onDelete, index }) => {
  const [editingStock, setEditingStock] = useState(false);
  const [stockValue, setStockValue] = useState(String(product.stockQuantity || 0));
  const [saving, setSaving] = useState(false);

  const isOutOfStock = (product.stockQuantity || 0) <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;
  const discount =
    product.mrp && product.basePrice && product.mrp > product.basePrice
      ? Math.round(((product.mrp - product.basePrice) / product.mrp) * 100)
      : 0;

  const handleSaveStock = async () => {
    const qty = parseInt(stockValue, 10);
    if (isNaN(qty) || qty < 0) return;
    setSaving(true);
    await onStockUpdate(product.productId, qty);
    setSaving(false);
    setEditingStock(false);
  };

  return (
    <Reanimated.View
      entering={FadeInDown.delay(index * 40).duration(300)}
      layout={Layout.springify()}
    >
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          padding: 16,
          marginHorizontal: 16,
          marginBottom: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
          opacity: product.isActive ? 1 : 0.55,
        }}
      >
        {/* Main Row */}
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#1C1C1E" }}>
              {product.name}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, gap: 6 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#1C1C1E" }}>
                ₹{product.basePrice}
              </Text>
              {product.mrp && product.mrp > product.basePrice && (
                <Text
                  style={{
                    fontSize: 12,
                    color: "#C7C7CC",
                    textDecorationLine: "line-through",
                  }}
                >
                  ₹{product.mrp}
                </Text>
              )}
              {discount > 0 && (
                <View
                  style={{
                    backgroundColor: "#E8F5E9",
                    borderRadius: 4,
                    paddingHorizontal: 5,
                    paddingVertical: 1,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#2E7D32" }}>
                    {discount}% OFF
                  </Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 12, color: "#8E8E93", marginTop: 2 }}>{product.unit}</Text>

            {/* Stock Badges */}
            {isOutOfStock && (
              <View
                style={{
                  backgroundColor: "#FFEBEE",
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  marginTop: 6,
                  alignSelf: "flex-start",
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: "700", color: "#C62828" }}>
                  OUT OF STOCK
                </Text>
              </View>
            )}
            {isLowStock && (
              <View
                style={{
                  backgroundColor: "#FFF3E0",
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  marginTop: 6,
                  alignSelf: "flex-start",
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: "700", color: "#E65100" }}>
                  Only {product.stockQuantity} left
                </Text>
              </View>
            )}
          </View>

          {/* Right Actions */}
          <View style={{ alignItems: "flex-end", gap: 8 }}>
            <Switch
              value={product.isActive}
              onValueChange={(val) => onToggleActive(product.productId, val)}
              trackColor={{ false: "#E5E7EB", true: "#C8E6C9" }}
              thumbColor={product.isActive ? "#2E7D32" : "#9CA3AF"}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
            <View style={{ flexDirection: "row", gap: 6 }}>
              <TouchableOpacity
                onPress={() => onEdit(product)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: "#F2F2F7",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Pencil size={14} color="#3C3C43" strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert("Delete Product", `Delete "${product.name}"?`, [
                    { text: "Cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => onDelete(product.productId),
                    },
                  ]);
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: "#FFEBEE",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Trash2 size={14} color="#C62828" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Stock Controls */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: "#F2F2F7",
          }}
        >
          <Package size={14} color="#8E8E93" strokeWidth={2} />
          <Text style={{ fontSize: 12, color: "#8E8E93", marginLeft: 4 }}>Stock:</Text>

          {editingStock ? (
            <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 8, flex: 1 }}>
              <TouchableOpacity
                onPress={() =>
                  setStockValue(String(Math.max(0, parseInt(stockValue || "0", 10) - 1)))
                }
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: "#F2F2F7",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Minus size={14} color="#3C3C43" strokeWidth={2.5} />
              </TouchableOpacity>
              <TextInput
                value={stockValue}
                onChangeText={setStockValue}
                keyboardType="number-pad"
                style={{
                  textAlign: "center",
                  fontWeight: "700",
                  fontSize: 15,
                  color: "#1C1C1E",
                  marginHorizontal: 8,
                  width: 50,
                }}
              />
              <TouchableOpacity
                onPress={() =>
                  setStockValue(String(parseInt(stockValue || "0", 10) + 1))
                }
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: "#F2F2F7",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={14} color="#3C3C43" strokeWidth={2.5} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveStock}
                disabled={saving}
                style={{
                  marginLeft: 10,
                  backgroundColor: "#2C2C2E",
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 8,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>
                  {saving ? "..." : "Save"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setEditingStock(false);
                  setStockValue(String(product.stockQuantity || 0));
                }}
                style={{ marginLeft: 6 }}
              >
                <Text style={{ fontSize: 12, color: "#8E8E93", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setEditingStock(true)}
              style={{ flexDirection: "row", alignItems: "center", marginLeft: 8 }}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#1C1C1E" }}>
                {product.stockQuantity || 0}
              </Text>
              <Text style={{ fontSize: 11, fontWeight: "600", color: "#3C3C43", marginLeft: 8 }}>
                Edit
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Reanimated.View>
  );
};

// ── Main Component ──
const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const {
    data: productsData,
    isLoading: loading,
    refetch: loadProducts,
    isRefetching: refreshing,
  } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: fetchAllProducts,
  });

  const products = Array.isArray(productsData) ? productsData : [];

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.unit || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      basePrice: String(product.basePrice || ""),
      mrp: String(product.mrp || ""),
      stockQuantity: String(product.stockQuantity || 0),
      unit: product.unit || "500g",
      categoryId: product.categoryId || "",
      isActive: product.isActive !== false,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Alert.alert("Missing Info", "Product name is required.");
      return;
    }
    if (!form.basePrice) {
      Alert.alert("Missing Info", "Base price is required.");
      return;
    }
    if (!form.unit.trim()) {
      Alert.alert("Missing Info", "Unit is required.");
      return;
    }
    if (!PRESET_UNITS.includes(form.unit) && !isValidUnit(form.unit)) {
      Alert.alert("Invalid Unit", "Unit must end with a valid suffix (g, kg, pcs, ml, L, oz, lb, dozen, pack, box, bundle).");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        basePrice: parseFloat(form.basePrice),
        mrp: form.mrp ? parseFloat(form.mrp) : null,
        stockQuantity: parseInt(form.stockQuantity || "0", 10),
        unit: form.unit,
        categoryId: form.categoryId || null,
        isActive: form.isActive,
      };

      if (editingProduct) {
        const updated = await updateProduct(editingProduct.productId, payload);
        queryClient.setQueryData(["adminProducts"], (old) => {
          if (!old) return [];
          return old.map((p) =>
            p.productId === editingProduct.productId ? { ...p, ...updated, ...payload } : p
          );
        });
      } else {
        const created = await createProduct(payload);
        if (created?.productId) {
          queryClient.setQueryData(["adminProducts"], (old) => {
            if (!old) return [{ ...payload, ...created }];
            return [{ ...payload, ...created }, ...old];
          });
        } else {
          loadProducts(); // Fallback refresh
        }
      }
      setModalVisible(false);
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStockUpdate = async (productId, qty) => {
    // Optimistic update
    queryClient.setQueryData(["adminProducts"], (old) => {
      if (!old) return [];
      return old.map((p) => (p.productId === productId ? { ...p, stockQuantity: qty } : p));
    });

    try {
      await updateStock(productId, qty);
    } catch (e) {
      loadProducts();
      Alert.alert("Error", e?.message || "Stock update failed");
    }
  };

  const handleToggleActive = async (productId, isActive) => {
    // Optimistic update
    queryClient.setQueryData(["adminProducts"], (old) => {
      if (!old) return [];
      return old.map((p) => (p.productId === productId ? { ...p, isActive } : p));
    });
    try {
      await updateProduct(productId, { isActive });
    } catch (e) {
      // Rollback
      loadProducts();
      Alert.alert("Error", e?.message || "Toggle failed");
    }
  };

  const handleDelete = async (productId) => {
    // Optimistic update
    queryClient.setQueryData(["adminProducts"], (old) => {
      if (!old) return [];
      return old.filter((p) => p.productId !== productId);
    });
    try {
      await deleteProduct(productId);
    } catch (e) {
      loadProducts();
      Alert.alert("Error", e?.message || "Delete failed");
    }
  };

  const updateFormField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F8FC" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: STATUSBAR_HEIGHT + 8,
          paddingHorizontal: 20,
          paddingBottom: 8,
          backgroundColor: "#F8F8FC",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <View>
          <Text style={{ fontSize: 26, fontWeight: "800", color: "#1C1C1E" }}>Products</Text>
          <Text style={{ fontSize: 13, color: "#8E8E93", marginTop: 2 }}>
            {products.length} products · {products.filter((p) => p.isActive).length} active
          </Text>
        </View>
        <TouchableOpacity
          onPress={openCreateModal}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#2C2C2E",
            paddingHorizontal: 14,
            paddingVertical: 9,
            borderRadius: 12,
            marginBottom: 4,
          }}
          activeOpacity={0.8}
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700", marginLeft: 4 }}>
            Add
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: Platform.OS === "ios" ? 10 : 4,
            borderWidth: 1,
            borderColor: "#EEEFF3",
          }}
        >
          <Search size={18} color="#C7C7CC" strokeWidth={2} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products..."
            placeholderTextColor="#C7C7CC"
            style={{
              flex: 1,
              fontSize: 14,
              color: "#1C1C1E",
              marginLeft: 10,
              fontWeight: "500",
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={16} color="#C7C7CC" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Products List */}
      {loading ? (
        <ListSkeleton count={6} />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.productId}
          renderItem={({ item, index }) => (
            <ProductCard
              product={item}
              index={index}
              onEdit={openEditModal}
              onStockUpdate={handleStockUpdate}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadProducts}
              tintColor="#3C3C43"
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={Package}
              title="No products found"
              subtitle={searchQuery ? "Try a different search term" : "Add your first product"}
              ctaLabel={!searchQuery ? "Add Product" : undefined}
              onCtaPress={!searchQuery ? openCreateModal : undefined}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Create/Edit Modal */}
      <FormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editingProduct ? "Edit Product" : "Add Product"}
        subtitle={editingProduct ? `Editing ${editingProduct.name}` : "Fill in the product details"}
        onSubmit={handleSubmit}
        submitLabel={editingProduct ? "Update Product" : "Create Product"}
        submitting={submitting}
      >
        <FormField label="Product Name" required>
          <FormInput
            value={form.name}
            onChangeText={(v) => updateFormField("name", v)}
            placeholder="e.g. Chicken Breast"
          />
        </FormField>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <FormField label="Base Price (₹)" required style={{ flex: 1 }}>
            <FormInput
              value={form.basePrice}
              onChangeText={(v) => updateFormField("basePrice", v)}
              placeholder="299"
              keyboardType="numeric"
            />
          </FormField>
          <FormField label="MRP (₹)" style={{ flex: 1 }}>
            <FormInput
              value={form.mrp}
              onChangeText={(v) => updateFormField("mrp", v)}
              placeholder="350"
              keyboardType="numeric"
            />
          </FormField>
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <FormField label="Stock" style={{ flex: 1 }}>
            <FormInput
              value={form.stockQuantity}
              onChangeText={(v) => updateFormField("stockQuantity", v)}
              placeholder="50"
              keyboardType="numeric"
            />
          </FormField>
          <FormField label="Unit" style={{ flex: 1 }}>
            {/* Preset chips */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {PRESET_UNITS.map((u) => (
                <TouchableOpacity
                  key={u}
                  onPress={() => updateFormField("unit", u)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: form.unit === u ? "#2C2C2E" : "#F2F2F7",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: form.unit === u ? "#FFFFFF" : "#3C3C43",
                    }}
                  >
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Custom unit input */}
            <View style={{ marginTop: 8 }}>
              <TextInput
                value={!PRESET_UNITS.includes(form.unit) ? form.unit : ""}
                onChangeText={(v) => {
                  const sanitized = sanitizeUnit(v);
                  if (sanitized || v === "") {
                    updateFormField("unit", sanitized);
                  }
                }}
                placeholder="Or type custom: e.g. 2kg, 100g, 3pcs"
                placeholderTextColor="#C7C7CC"
                style={{
                  backgroundColor: "#F8F8FC",
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor:
                    form.unit && !PRESET_UNITS.includes(form.unit) && !isValidUnit(form.unit)
                      ? "#FFCDD2"
                      : "#EEEFF3",
                  paddingHorizontal: 12,
                  paddingVertical: Platform.OS === "ios" ? 10 : 6,
                  fontSize: 13,
                  color: "#1C1C1E",
                  fontWeight: "500",
                }}
              />
              {form.unit &&
                !PRESET_UNITS.includes(form.unit) &&
                !isValidUnit(form.unit) && (
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#C62828",
                      marginTop: 4,
                      marginLeft: 2,
                    }}
                  >
                    Must end with: g, kg, pcs, pc, ml, L, oz, lb, dozen, pack, box, bundle
                  </Text>
                )}
            </View>
          </FormField>
        </View>

        <FormField label="Image URL">
          <FormInput
            value={form.imageUrl}
            onChangeText={(v) => updateFormField("imageUrl", v)}
            placeholder="https://..."
          />
        </FormField>

        <FormField label="Description">
          <FormInput
            value={form.description}
            onChangeText={(v) => updateFormField("description", v)}
            placeholder="Optional product description"
            multiline
            numberOfLines={3}
          />
        </FormField>

        <FormField label="Category ID">
          <FormInput
            value={form.categoryId}
            onChangeText={(v) => updateFormField("categoryId", v)}
            placeholder="Optional category UUID"
          />
        </FormField>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#F8F8FC",
            borderRadius: 12,
            padding: 14,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#1C1C1E" }}>Active</Text>
          <Switch
            value={form.isActive}
            onValueChange={(v) => updateFormField("isActive", v)}
            trackColor={{ false: "#E5E7EB", true: "#C8E6C9" }}
            thumbColor={form.isActive ? "#2E7D32" : "#9CA3AF"}
          />
        </View>
      </FormModal>
    </View>
  );
};

export default AdminProducts;
