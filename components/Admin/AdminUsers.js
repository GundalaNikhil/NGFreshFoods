import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  TextInput,
  Platform,
} from "react-native";
import Reanimated, { FadeInDown } from "react-native-reanimated";
import { ArrowLeft, User, ShoppingBag, Search, X, Shield, Phone, Mail } from "lucide-react-native";
import { fetchAllUsers } from "../../services/bff/adminBff";
import AdminHeader from "./shared/AdminHeader";
import { ListSkeleton } from "./shared/SkeletonLoader";
import EmptyState from "./shared/EmptyState";

// ── User Card ──
const UserCard = ({ user, index }) => {
  const initial = (user.firstName || user.email || "?").charAt(0).toUpperCase();
  const isAdmin = user.role === "ADMIN";

  return (
    <Reanimated.View entering={FadeInDown.delay(index * 30).duration(250)}>
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
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Avatar */}
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: isAdmin ? "#EDE7F6" : "#E3F2FD",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            {isAdmin ? (
              <Shield size={20} color="#4527A0" strokeWidth={2} />
            ) : (
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: "#1565C0",
                }}
              >
                {initial}
              </Text>
            )}
          </View>

          {/* User Info */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#1C1C1E" }}>
                {user.firstName || ""} {user.lastName || ""}
              </Text>
              {isAdmin && (
                <View
                  style={{
                    backgroundColor: "#EDE7F6",
                    borderRadius: 4,
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                  }}
                >
                  <Text style={{ fontSize: 9, fontWeight: "800", color: "#4527A0" }}>ADMIN</Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 3, gap: 4 }}>
              {user.phoneNumber ? (
                <>
                  <Phone size={11} color="#8E8E93" strokeWidth={2} />
                  <Text style={{ fontSize: 12, color: "#8E8E93" }}>{user.phoneNumber}</Text>
                </>
              ) : user.email ? (
                <>
                  <Mail size={11} color="#8E8E93" strokeWidth={2} />
                  <Text style={{ fontSize: 12, color: "#8E8E93" }}>{user.email}</Text>
                </>
              ) : null}
            </View>
          </View>

          {/* Order Count */}
          <View style={{ alignItems: "flex-end" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <ShoppingBag size={13} color="#8E8E93" strokeWidth={2} />
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#3C3C43" }}>
                {user.orderCount || 0}
              </Text>
            </View>
            <Text style={{ fontSize: 10, color: "#C7C7CC", marginTop: 2 }}>orders</Text>
          </View>
        </View>

        {/* Joined date */}
        <Text style={{ fontSize: 10, color: "#C7C7CC", marginTop: 10 }}>
          Joined{" "}
          {user.createdAt
            ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </Text>
      </View>
    </Reanimated.View>
  );
};

// ── Main Component ──
const AdminUsers = ({ onBack }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      const result = await fetchAllUsers();
      setUsers(Array.isArray(result) ? result : []);
    } catch (e) {
      console.warn("Users error:", e?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase().trim();
    return users.filter(
      (u) =>
        (u.firstName || "").toLowerCase().includes(q) ||
        (u.lastName || "").toLowerCase().includes(q) ||
        (u.phoneNumber || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F8FC" }}>
      <AdminHeader
        title="Users"
        subtitle={`${users.length} registered users`}
        onBack={onBack}
      />

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
            placeholder="Search by name, phone, email..."
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

      {loading ? (
        <ListSkeleton count={6} />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.userId}
          renderItem={({ item, index }) => <UserCard user={item} index={index} />}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadUsers();
              }}
              tintColor="#3C3C43"
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={User}
              title="No users found"
              subtitle={searchQuery ? "Try a different search term" : "Users will appear as they register"}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default AdminUsers;
