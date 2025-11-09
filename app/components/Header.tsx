import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Header = () => {
  return (
    <View style={styles.container}>
      {/* Logo + Nome */}
      <View style={styles.logoContainer}>
        <View style={styles.iconBackground}>
          <Ionicons name="flash" size={18} color="#FFD700" />
        </View>
        <Text style={styles.title}>EnergyPro</Text>
      </View>

      {/* Ícone de perfil */}
      <TouchableOpacity style={styles.profileButton}>
        <Ionicons name="person-circle-outline" size={28} color="#8A99A6" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0E1621",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2A36",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBackground: {
    backgroundColor: "#1ED760",
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  profileButton: {
    padding: 4,
  },
});

export default Header;
