import { Search, X } from "lucide-react-native";
import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Keyboard,
  Text,
} from "react-native";
import { useProducts } from "../../hooks/useProducts";

const ProductSearchBar = () => {
  const { searchQuery, setSearchQuery, setSelectedCategory } = useProducts();
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      setSearchQuery(localQuery);
    }, 120);

    return () => {
      globalThis.clearTimeout(timer);
    };
  }, [localQuery, setSearchQuery]);

  const handleClear = useCallback(() => {
    setLocalQuery("");
    setSearchQuery("");
    setIsFocused(false);
    Keyboard.dismiss();
  }, [setSearchQuery]);

  return (
    <View style={styles.wrapper}>
      {/* Header title */}
      <Text style={styles.headerTitle}>Fresh Menu</Text>
      <View style={[styles.bar, isFocused && styles.barFocused]}>
        <View style={styles.searchIconContainer}>
          <Search size={18} color={isFocused ? "#E23744" : "#9CA3AF"} strokeWidth={2.2} />
        </View>
        <TextInput
          ref={inputRef}
          value={localQuery}
          onChangeText={(text) => {
            setLocalQuery(text);
            if (text.length > 0) setSelectedCategory("ALL");
          }}
          onFocus={() => {
            setIsFocused(true);
            setSelectedCategory("ALL");
          }}
          onBlur={() => {
            if (!localQuery) setIsFocused(false);
          }}
          placeholder="Search for chicken, eggs, mutton..."
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          returnKeyType="search"
          autoCorrect={false}
          selectionColor="#E23744"
        />
        {localQuery.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.clearBtn}
          >
            <View style={styles.clearCircle}>
              <X size={12} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1A1A2E',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F7",
    borderRadius: 14,
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: "#F5F5F7",
  },
  barFocused: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FECDD3",
    shadowColor: "#E23744",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIconContainer: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#1A1A2E",
    paddingVertical: 0,
    height: 46,
    letterSpacing: 0.1,
  },
  clearBtn: {
    marginLeft: 8,
  },
  clearCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ProductSearchBar;
