import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Switch,
  Alert,
  Platform,
} from "react-native";
import Reanimated, { FadeInDown, Layout } from "react-native-reanimated";
import { ArrowLeft, Tag, Plus, Pencil, Trash2, Percent, DollarSign } from "lucide-react-native";
import { fetchAllCoupons, createCoupon, updateCoupon, deleteCoupon } from "../../services/bff/adminBff";
import { apiClient } from "../../services/http/apiClient";
import { API_ENDPOINTS } from "../../services/config/endpoints";
import AdminHeader from "./shared/AdminHeader";
import { ListSkeleton } from "./shared/SkeletonLoader";
import EmptyState from "./shared/EmptyState";
import FormModal, { FormField, FormInput } from "./shared/FormModal";

const EMPTY_FORM = {
  code: "",
  title: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minOrderAmount: "",
  maxDiscountAmount: "",
  usageLimit: "",
  validFrom: "",
  validTo: "",
};

// ── Coupon Card ──
const CouponCard = ({ coupon, onEdit, onDelete, onToggle, index }) => {
  const isExpired = coupon.validTo && new Date(coupon.validTo) < new Date();
  const isActive = coupon.active !== false && coupon.isActive !== false;

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
          opacity: isActive && !isExpired ? 1 : 0.55,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          {/* Icon */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "#FDF2F8",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Tag size={18} color="#DB2777" strokeWidth={2} />
          </View>

          {/* Info */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#1C1C1E", letterSpacing: 0.5 }}>
              {coupon.code}
            </Text>
            <Text style={{ fontSize: 12, color: "#8E8E93", marginTop: 2 }}>
              {coupon.title || coupon.description}
            </Text>
          </View>

          {/* Discount Badge */}
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#DB2777" }}>
              {coupon.discountType === "PERCENTAGE"
                ? `${coupon.discountValue}%`
                : `₹${coupon.discountValue}`}
            </Text>
            {isExpired && (
              <View
                style={{
                  backgroundColor: "#FFEBEE",
                  borderRadius: 6,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  marginTop: 4,
                }}
              >
                <Text style={{ fontSize: 9, fontWeight: "700", color: "#C62828" }}>EXPIRED</Text>
              </View>
            )}
          </View>
        </View>

        {/* Details Row */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: "#F2F2F7",
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 11, color: "#8E8E93" }}>
            Min ₹{coupon.minOrderAmount || 0}
          </Text>
          <Text style={{ fontSize: 11, color: "#8E8E93" }}>
            Max ₹{coupon.maxDiscountAmount || "—"}
          </Text>
          <Text style={{ fontSize: 11, color: "#8E8E93" }}>
            {coupon.usageLimit ? `${coupon.usageLimit} uses` : "Unlimited"}
          </Text>
        </View>

        {/* Actions */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: 10,
            gap: 8,
          }}
        >
          <TouchableOpacity
            onPress={() => onEdit(coupon)}
            style={{
              width: 34,
              height: 34,
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
              Alert.alert("Delete Coupon", `Delete coupon "${coupon.code}"?`, [
                { text: "Cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => onDelete(coupon.couponId),
                },
              ]);
            }}
            style={{
              width: 34,
              height: 34,
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
    </Reanimated.View>
  );
};

// ── Main Component ──
const AdminCoupons = ({ onBack }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const loadCoupons = useCallback(async () => {
    try {
      // Try admin endpoint first, fallback to active coupons
      let result;
      try {
        result = await fetchAllCoupons();
      } catch {
        const response = await apiClient.get(API_ENDPOINTS.COUPONS_ACTIVE);
        result = response?.data || [];
      }
      setCoupons(Array.isArray(result) ? result : []);
    } catch (e) {
      console.warn("Coupons error:", e?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code || "",
      title: coupon.title || "",
      description: coupon.description || "",
      discountType: coupon.discountType || "PERCENTAGE",
      discountValue: String(coupon.discountValue || ""),
      minOrderAmount: String(coupon.minOrderAmount || ""),
      maxDiscountAmount: String(coupon.maxDiscountAmount || ""),
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
      validFrom: coupon.validFrom || "",
      validTo: coupon.validTo || "",
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!form.code.trim()) {
      Alert.alert("Missing Info", "Coupon code is required.");
      return;
    }
    if (!form.discountValue) {
      Alert.alert("Missing Info", "Discount value is required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        title: form.title.trim(),
        description: form.description.trim(),
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : 0,
        maxDiscountAmount: form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : null,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit, 10) : null,
        validFrom: form.validFrom || null,
        validTo: form.validTo || null,
      };

      if (editingCoupon) {
        const updated = await updateCoupon(editingCoupon.couponId, payload);
        setCoupons((prev) =>
          prev.map((c) =>
            c.couponId === editingCoupon.couponId ? { ...c, ...payload, ...updated } : c
          )
        );
      } else {
        const created = await createCoupon(payload);
        if (created?.couponId) {
          setCoupons((prev) => [{ ...payload, ...created }, ...prev]);
        } else {
          loadCoupons();
        }
      }
      setModalVisible(false);
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to save coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (couponId) => {
    const previous = [...coupons];
    setCoupons((prev) => prev.filter((c) => c.couponId !== couponId));
    try {
      await deleteCoupon(couponId);
    } catch (e) {
      setCoupons(previous);
      Alert.alert("Error", e?.message || "Delete failed");
    }
  };

  const updateFormField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F8FC" }}>
      <AdminHeader
        title="Coupons"
        subtitle={`${coupons.length} coupons`}
        onBack={onBack}
        rightAction={openCreateModal}
        rightIcon={Plus}
        rightLabel="Add"
      />

      {loading ? (
        <ListSkeleton count={4} />
      ) : (
        <FlatList
          data={coupons}
          keyExtractor={(item) => item.couponId || item.code}
          renderItem={({ item, index }) => (
            <CouponCard
              coupon={item}
              index={index}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadCoupons();
              }}
              tintColor="#3C3C43"
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={Tag}
              title="No coupons yet"
              subtitle="Create your first coupon to attract customers"
              ctaLabel="Add Coupon"
              onCtaPress={openCreateModal}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Create/Edit Modal */}
      <FormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editingCoupon ? "Edit Coupon" : "Create Coupon"}
        subtitle={editingCoupon ? `Editing ${editingCoupon.code}` : "Set up a new discount coupon"}
        onSubmit={handleSubmit}
        submitLabel={editingCoupon ? "Update Coupon" : "Create Coupon"}
        submitting={submitting}
      >
        <FormField label="Coupon Code" required>
          <FormInput
            value={form.code}
            onChangeText={(v) => updateFormField("code", v.toUpperCase())}
            placeholder="e.g. FRESH20"
          />
        </FormField>

        <FormField label="Title">
          <FormInput
            value={form.title}
            onChangeText={(v) => updateFormField("title", v)}
            placeholder="e.g. 20% off your first order"
          />
        </FormField>

        {/* Discount Type Toggle */}
        <FormField label="Discount Type" required>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {["PERCENTAGE", "FLAT"].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => updateFormField("discountType", type)}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: form.discountType === type ? "#2C2C2E" : "#F2F2F7",
                  gap: 6,
                }}
              >
                {type === "PERCENTAGE" ? (
                  <Percent size={14} color={form.discountType === type ? "#FFFFFF" : "#3C3C43"} strokeWidth={2} />
                ) : (
                  <Text style={{ fontSize: 14, fontWeight: "700", color: form.discountType === type ? "#FFFFFF" : "#3C3C43" }}>₹</Text>
                )}
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: form.discountType === type ? "#FFFFFF" : "#3C3C43",
                  }}
                >
                  {type === "PERCENTAGE" ? "Percentage" : "Flat Amount"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </FormField>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <FormField label="Discount Value" required style={{ flex: 1 }}>
            <FormInput
              value={form.discountValue}
              onChangeText={(v) => updateFormField("discountValue", v)}
              placeholder={form.discountType === "PERCENTAGE" ? "20" : "100"}
              keyboardType="numeric"
            />
          </FormField>
          <FormField label="Min Order (₹)" style={{ flex: 1 }}>
            <FormInput
              value={form.minOrderAmount}
              onChangeText={(v) => updateFormField("minOrderAmount", v)}
              placeholder="500"
              keyboardType="numeric"
            />
          </FormField>
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <FormField label="Max Discount (₹)" style={{ flex: 1 }}>
            <FormInput
              value={form.maxDiscountAmount}
              onChangeText={(v) => updateFormField("maxDiscountAmount", v)}
              placeholder="200"
              keyboardType="numeric"
            />
          </FormField>
          <FormField label="Usage Limit" style={{ flex: 1 }}>
            <FormInput
              value={form.usageLimit}
              onChangeText={(v) => updateFormField("usageLimit", v)}
              placeholder="100"
              keyboardType="numeric"
            />
          </FormField>
        </View>

        <FormField label="Description">
          <FormInput
            value={form.description}
            onChangeText={(v) => updateFormField("description", v)}
            placeholder="Optional coupon description"
            multiline
            numberOfLines={2}
          />
        </FormField>
      </FormModal>
    </View>
  );
};

export default AdminCoupons;
