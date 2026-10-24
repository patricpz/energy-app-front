import { StyleSheet } from "react-native";

export const deviceStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },

  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },

  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },

  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
  },

  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterButtonActive: {
    // Estilo adicional se necessário
  },

  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },

  devicesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  deviceCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  deviceInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  deviceIconContainer: {
    marginRight: 14,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deviceInfo: {
    flex: 1,
  },

  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },

  consumptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  consumptionLabel: {
    fontSize: 13,
    fontWeight: '400',
  },

  consumptionValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },

  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },

  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },

  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});