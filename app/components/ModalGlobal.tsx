import { XIcon } from "phosphor-react-native";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useTheme } from "../context/ThemeContext";

interface ModalGlobalProps {
  visible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
}

export default function ModalGlobal({
  visible,
  onClose,
  children,
  title,
}: ModalGlobalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {title || ""}
            </Text>

            <TouchableOpacity onPress={onClose}>
              <XIcon size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* CONTENT */}
          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  modalContainer: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
  },

  content: {
    marginTop: 4,
  },
});
