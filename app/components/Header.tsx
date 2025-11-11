import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

const Header = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.header, borderBottomColor: theme.colors.border }]}>
      {/* Logo + Nome */}
      <View style={styles.logoContainer}>
        <View style={[styles.iconBackground, { backgroundColor: theme.colors.primary }]}>
          <Ionicons name="flash" size={18} color="#FFD700" />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>EnergyPro</Text>
      </View>

      {/* Ícone de perfil */}
      <TouchableOpacity style={styles.profileButton}>
        <Ionicons name="person-circle-outline" size={28} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBackground: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  profileButton: {
    padding: 4,
  },
});

export default Header;
