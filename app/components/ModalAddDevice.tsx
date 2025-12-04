import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import ModalGlobal from "./ModalGlobal";

interface ModalAddDeviceProps {
  visible: boolean;
  onClose: () => void;
  onSave: (device: { name: string; consumption: number }) => void;
}

export default function ModalAddDevice({
  visible,
  onClose,
  onSave,
}: ModalAddDeviceProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [name, setName] = useState("");
  const [consumption, setConsumption] = useState("");

  function handleSave() {
    if (!name.trim() || !consumption.trim()) {
      return;
    }

    onSave({
      name,
      consumption: Number(consumption),
    });

    setName("");
    setConsumption("");

    onClose();
  }

  return (
    <ModalGlobal visible={visible} onClose={onClose} title="Adicionar Equipamento">
      <View style={styles.container}>
        {/* NOME */}
        <Text style={[styles.label, { color: colors.text }]}>Nome do equipamento</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex: Geladeira"
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
        />

        {/* CONSUMO */}
        <Text style={[styles.label, { color: colors.text }]}>Consumo (Watts)</Text>
        <TextInput
          value={consumption}
          onChangeText={setConsumption}
          placeholder="Ex: 150"
          keyboardType="numeric"
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
        />

        {/* BOTÃO SALVAR */}
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </ModalGlobal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },

  label: {
    fontSize: 14,
    marginBottom: 4,
  },

  input: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },

  button: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
