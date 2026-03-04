import { Search } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const SearchBar = () => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("Products");
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={styles.bar}
    >
      <Search size={18} color="#93959f" strokeWidth={2} style={styles.icon} />
      <Text style={styles.placeholder}>Search for chicken, eggs, mutton...</Text>
    </TouchableOpacity>
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
    borderColor: "#e5e7e3",
  },
  icon: {
    marginRight: 10,
  },
  placeholder: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400",
    color: "#93959f",
  },
});

export default SearchBar;
