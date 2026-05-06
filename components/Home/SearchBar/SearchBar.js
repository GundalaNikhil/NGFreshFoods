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
      <Search size={22} color="#93959F" strokeWidth={2} style={styles.icon} />
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
        placeholder="Search"
        placeholderTextColor="#93959F"
        style={styles.input}
        returnKeyType="search"
        autoCorrect={false}
        selectionColor="#1C1C1C"
      />
      {localQuery.length > 0 ? (
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
      ) : (
        <TouchableOpacity activeOpacity={0.6} style={styles.filterBtn}>
          {/* <SlidersHorizontal size={20} color="#1C1C1C" strokeWidth={2} /> */}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 30,
    height: 54,
    paddingHorizontal: 20,
  },
  barFocused: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E9E9EB",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#1c1c1c",
    paddingVertical: 0,
    height: 54,
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
  filterBtn: {
    marginLeft: 8,
    padding: 4,
  }
});

export default SearchBar;
