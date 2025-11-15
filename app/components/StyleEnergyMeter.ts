import { Theme } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 8,
      padding: 10,
      alignItems: "center",
      width: "100%",
      alignSelf: "center",
      borderColor: theme.colors.border,
      borderWidth: 2,
    },
    title: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 8,
    },
    display: {
      backgroundColor: theme.colors.displayBackground,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 10,
      marginBottom: 12,
      height: 88,
      width: 311,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
    },
    displayText: {
      color: theme.colors.highlight,
      fontFamily: "Digital",
      fontSize: 65,
      height: 50,
      letterSpacing: 3,
      textAlign: "center",
      textAlignVertical: "center",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      paddingHorizontal: 10,
      alignItems: "center",
    },
    pulseContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    pulseLabel: {
      color: theme.colors.text,
      fontSize: 13,
      marginRight: 6,
    },
    pulseDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.pulse,
    },
    unitContainer: {
      alignItems: "center",
    },
    unit: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: "600",
    },
    symbolBox: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 3,
      marginTop: 3,
    },
    symbolText: {
      color: theme.colors.textSecondary,
      fontSize: 10,
    },
  });
