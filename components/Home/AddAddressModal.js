import React, { useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { X, MapPin, Home, Briefcase, Heart, Check } from "lucide-react-native";

const { height: SCREEN_H } = Dimensions.get("window");

const INITIAL_FORM = {
  label: "Home",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  contactPhone: "",
  isDefault: true,
};

const AddAddressModal = ({ visible, onClose, onAdd }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ ...INITIAL_FORM });

  const isFormValid = form.addressLine1.trim() && form.city.trim() && form.postalCode.trim();

  const handleSubmit = async () => {
    if (!isFormValid || loading) return;
    setLoading(true);
    const payload = { ...form, label: form.label || "Home" };
    const result = await onAdd(payload);
    setLoading(false);
    if (result.success) {
      onClose();
      setForm({ ...INITIAL_FORM });
    }
  };

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const types = [
    { key: "Home", icon: Home },
    { key: "Work", icon: Briefcase },
    { key: "Other", icon: Heart },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1 bg-black/50" />

        <View className="bg-white rounded-t-[28px]" style={{ maxHeight: SCREEN_H * 0.88 }}>
          {/* Handle */}
          <View className="items-center pt-3 pb-2">
            <View className="w-9 h-1 rounded-full bg-gray-200" />
          </View>

          {/* Title Row */}
          <View className="flex-row items-center justify-between px-5 pb-4">
            <Text className="text-lg font-black text-gray-900">Add address</Text>
            <TouchableOpacity onPress={onClose} className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
              <X size={16} color="#6B7280" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Save As (compact pills) ── */}
            <View className="flex-row items-center mb-5">
              {types.map(({ key, icon: Icon }) => {
                const active = form.label === key;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => update("label", key)}
                    className={`flex-row items-center px-4 py-2 rounded-full mr-2 border ${
                      active ? "bg-[#107A4A] border-[#107A4A]" : "bg-white border-gray-200"
                    }`}
                    activeOpacity={0.8}
                  >
                    <Icon size={13} color={active ? "#fff" : "#9CA3AF"} strokeWidth={2.5} />
                    <Text className={`ml-1.5 text-[12px] font-bold ${active ? "text-white" : "text-gray-400"}`}>
                      {key}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Form Fields ── */}
            <View className="mb-4">
              <TextInput
                className="bg-[#F5F5F5] rounded-xl px-4 py-3.5 text-[14px] text-gray-900 font-medium mb-3"
                placeholder="House / Flat / Block No. *"
                placeholderTextColor="#787878"
                value={form.addressLine1}
                onChangeText={(t) => update("addressLine1", t)}
              />
              <TextInput
                className="bg-[#F5F5F5] rounded-xl px-4 py-3.5 text-[14px] text-gray-900 font-medium mb-3"
                placeholder="Apartment / Road / Area"
                placeholderTextColor="#787878"
                value={form.addressLine2}
                onChangeText={(t) => update("addressLine2", t)}
              />
              <View className="flex-row mb-3">
                <TextInput
                  className="flex-1 bg-[#F5F5F5] rounded-xl px-4 py-3.5 text-[14px] text-gray-900 font-medium mr-2"
                  placeholder="City *"
                  placeholderTextColor="#787878"
                  value={form.city}
                  onChangeText={(t) => update("city", t)}
                />
                <TextInput
                  className="flex-1 bg-[#F5F5F5] rounded-xl px-4 py-3.5 text-[14px] text-gray-900 font-medium"
                  placeholder="State"
                  placeholderTextColor="#787878"
                  value={form.state}
                  onChangeText={(t) => update("state", t)}
                />
              </View>
              <View className="flex-row mb-3">
                <TextInput
                  className="flex-1 bg-[#F5F5F5] rounded-xl px-4 py-3.5 text-[14px] text-gray-900 font-medium mr-2"
                  placeholder="Pincode *"
                  placeholderTextColor="#787878"
                  keyboardType="number-pad"
                  value={form.postalCode}
                  onChangeText={(t) => update("postalCode", t)}
                />
                <TextInput
                  className="flex-1 bg-[#F5F5F5] rounded-xl px-4 py-3.5 text-[14px] text-gray-900 font-medium"
                  placeholder="Phone (optional)"
                  placeholderTextColor="#787878"
                  keyboardType="phone-pad"
                  value={form.contactPhone}
                  onChangeText={(t) => update("contactPhone", t)}
                />
              </View>
            </View>

            {/* ── Default Toggle ── */}
            <TouchableOpacity
              onPress={() => update("isDefault", !form.isDefault)}
              className="flex-row items-center mb-6"
              activeOpacity={0.7}
            >
              <View
                className="w-5 h-5 rounded-md items-center justify-center mr-2.5"
                style={{ backgroundColor: form.isDefault ? "#107A4A" : "#D1D5DB" }}
              >
                {form.isDefault && <Check size={12} color="white" strokeWidth={3} />}
              </View>
              <Text className="text-[13px] text-gray-500 font-medium">
                Set as default address
              </Text>
            </TouchableOpacity>

            {/* ── Save Button ── */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isFormValid || loading}
              className={`h-[52px] rounded-2xl flex-row items-center justify-center ${
                !isFormValid || loading ? "bg-gray-200" : "bg-[#107A4A]"
              }`}
              activeOpacity={0.9}
              style={
                isFormValid && !loading
                  ? { shadowColor: "#059669", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 }
                  : {}
              }
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className={`font-black text-[14px] uppercase tracking-wider ${isFormValid ? "text-white" : "text-gray-400"}`}>
                  Save Address
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddAddressModal;
