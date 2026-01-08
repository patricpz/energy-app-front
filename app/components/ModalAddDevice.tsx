import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { createDevice } from "../services/devices";
import ModalGlobal from "./ModalGlobal";

interface ModalAddDeviceProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void; // Callback para atualizar a lista após salvar
}

export default function ModalAddDevice({
  visible,
  onClose,
  onSave,
}: ModalAddDeviceProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [name, setName] = useState("");
  const [consumeKwh, setConsumeKwh] = useState("");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);

  function handleClose() {
    setName("");
    setConsumeKwh("");
    setModel("");
    onClose();
  }

  async function handleSave() {
    // Validação
    if (!name.trim()) {
      Alert.alert("Erro", "Por favor, informe o nome do equipamento.");
      return;
    }

    if (!consumeKwh.trim()) {
      Alert.alert("Erro", "Por favor, informe o consumo em kWh.");
      return;
    }

    const consumeKwhNumber = parseFloat(consumeKwh.replace(",", "."));
    if (isNaN(consumeKwhNumber) || consumeKwhNumber <= 0) {
      Alert.alert("Erro", "Por favor, informe um valor válido para o consumo.");
      return;
    }

    if (!model.trim()) {
      Alert.alert("Erro", "Por favor, informe o modelo do equipamento.");
      return;
    }

    try {
      setLoading(true);
      await createDevice({
        name: name.trim(),
        consumeKwh: consumeKwhNumber,
        model: model.trim(),
      });

      Alert.alert("Sucesso", "Equipamento cadastrado com sucesso!");
      setName("");
      setConsumeKwh("");
      setModel("");
      onSave(); // Atualiza a lista
      onClose();
    } catch (error: any) {
      console.error("Erro ao cadastrar equipamento:", error);
      Alert.alert(
        "Erro",
        error.message || "Não foi possível cadastrar o equipamento. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalGlobal visible={visible} onClose={handleClose} title="Adicionar Equipamento">
      <View style={styles.container}>
        {/* NOME */}
        <Text style={[styles.label, { color: colors.text }]}>Nome do equipamento *</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex: Geladeira de cozinha"
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          editable={!loading}
        />

        {/* MODELO */}
        <Text style={[styles.label, { color: colors.text }]}>Modelo *</Text>
        <TextInput
          value={model}
          onChangeText={setModel}
          placeholder="Ex: Brastemp BRM44HK"
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          editable={!loading}
        />

        {/* CONSUMO */}
        <Text style={[styles.label, { color: colors.text }]}>Consumo (kWh) *</Text>
        <TextInput
          value={consumeKwh}
          onChangeText={(text) => {
            // Permite apenas números e vírgula/ponto
            const cleaned = text.replace(/[^0-9.,]/g, "");
            setConsumeKwh(cleaned);
          }}
          placeholder="Ex: 0.45"
          keyboardType="decimal-pad"
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          editable={!loading}
        />

        <Text style={[styles.hint, { color: colors.textTertiary }]}>
          * Campos obrigatórios
        </Text>

        {/* BOTÕES */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            onPress={handleClose}
            style={[
              styles.button,
              styles.buttonCancel,
              { borderColor: colors.border },
            ]}
            disabled={loading}
          >
            <Text style={[styles.buttonTextCancel, { color: colors.textSecondary }]}>
              Cancelar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSave}
            style={[
              styles.button,
              styles.buttonSave,
              { backgroundColor: colors.primary },
              loading && styles.buttonDisabled,
            ]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.buttonText || "#FFFFFF"} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.buttonText || "#FFFFFF" }]}>
                Salvar
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ModalGlobal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },

  input: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },

  hint: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: -8,
  },

  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },

  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },

  buttonCancel: {
    borderWidth: 1,
    backgroundColor: "transparent",
  },

  buttonSave: {
    // Estilo aplicado inline
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },

  buttonTextCancel: {
    fontSize: 16,
    fontWeight: "600",
  },
});
