import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Header from "../components/Header";
import ModalBLEConnection from "../components/ModalBLEConnection";
import { useTheme } from "../context/ThemeContext";
import SafeScreen from "../SafeScreen";

export default function Booking() {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeScreen>
      <ScrollView>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <Header />
          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Configuração de Dispositivo
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Conecte seu ESP32 via Bluetooth Low Energy para configurar e controlar o dispositivo.
            </Text>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={() => setModalVisible(true)}
            >
              <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
                Conectar ESP32 via BLE
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <ModalBLEConnection
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
