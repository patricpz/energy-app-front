import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  container: {
    paddingBottom: 20,
    gap: 20,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 8,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  connectedBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  connectedText: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  deviceCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: "600",
  },
  connectButton: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  messageInput: {
    minHeight: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: "top",
    fontSize: 14,
  },
  logTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  logList: {
    paddingBottom: 20,
    gap: 12,
  },
  logCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  logHeader: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "600",
  },
  logBody: {
    fontSize: 14,
  },
});