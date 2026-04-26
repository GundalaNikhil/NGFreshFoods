import { Search, X } from "lucide-react-native";
import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Keyboard,
} from "react-native";
import { useProducts } from "../../../hooks/useProducts";

const SearchBar = () => {
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
    <View style={[styles.bar, isFocused && styles.barFocused]}>
      <Search size={18} color="#686b78" strokeWidth={2.2} style={styles.icon} />
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
        placeholderTextColor="#686b78"
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
            <X size={12} color="#fff" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E9E9EB",
  },
  barFocused: {
    borderColor: "#d0d0d0",
    backgroundColor: "#fff",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400",
    color: "#1c1c1c",
    paddingVertical: 0,
    height: 44,
  },
  clearBtn: {
    marginLeft: 8,
  },
  clearCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#686B78",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SearchBar;
