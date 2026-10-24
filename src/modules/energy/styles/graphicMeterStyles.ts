import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 10,
        margin: 1,
        width: "100%",
    },
    headerContainer: {
        flexDirection: "column",
        marginBottom: 12,
    },
    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
    },
    headerInfoRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerLabel: {
        fontSize: 13,
        fontWeight: "500",
    },
    headerValue: {
        fontSize: 13,
        fontWeight: "600",
    },
    activeFilterRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    activeIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    activeFilterText: {
        fontSize: 12,
        fontWeight: "500",
    },
    activeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    activeBadgeText: {
        fontSize: 11,
        fontWeight: "700",
    },
    lastUpdateRow: {
        marginBottom: 8,
    },
    lastUpdateLabel: {
        fontSize: 11,
        fontWeight: "400",
    },
    filterContainer: {
        marginBottom: 12,
    },
    filterLabel: {
        fontSize: 13,
        marginBottom: 8,
        fontWeight: "500",
    },
    filterRow: {
        flexDirection: "row",
        gap: 8,
    },
    yearSelectorContainer: {
        marginTop: 12,
    },
    yearSelectorLabel: {
        fontSize: 13,
        marginBottom: 8,
        fontWeight: "500",
    },
    yearSelectorRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    yearSelectorButton: {
        padding: 8,
        borderRadius: 8,
        borderWidth: 1.5,
        justifyContent: "center",
        alignItems: "center",
    },
    yearSelectorValue: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1.5,
        alignItems: "center",
    },
    yearSelectorText: {
        fontSize: 14,
        fontWeight: "600",
    },
    filterBadge: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1.5,
        minWidth: 70,
        alignItems: "center",
    },
    filterBadgeText: {
        fontSize: 13,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        marginTop: 8,
        marginBottom: 10,
    },
    chartFrame: {
        borderRadius: 12,
        borderWidth: 1,
        paddingTop: 12,
        paddingBottom: 8,
        paddingRight: 12,
        overflow: "hidden",
    },
    selectedPointContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
    },
    selectedPointText: {
        fontSize: 15,
    },
    closeButton: {
        fontSize: 20,
        fontWeight: "bold",
        paddingHorizontal: 8,
    },
    pieChartContainer: {
        alignItems: "center",
        marginVertical: 20,
    },
    tooltipContainer: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
        minWidth: 80,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tooltipText: {
        fontSize: 14,
        fontWeight: "600",
    },
    currentConsumptionContainer: {
        alignItems: "center",
        marginVertical: 20,
    },
    currentConsumptionValue: {
        fontSize: 48,
        fontWeight: "700",
        marginBottom: 4,
    },
    currentConsumptionLabel: {
        fontSize: 14,
        fontWeight: "400",
    },
    averageContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 12,
        paddingLeft: 4,
    },
    averageLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    averageCircle: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    averageText: {
        fontSize: 13,
        fontWeight: "500",
    },
    expandButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    expandButtonText: {
        fontSize: 12,
        fontWeight: "600",
    },
    expandedInfoContainer: {
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    trendContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
        marginBottom: 16,
    },
    trendLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    trendCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    trendLabel: {
        fontSize: 12,
        fontWeight: "500",
    },
    trendLine: {
        flex: 1,
        height: 2,
        marginHorizontal: 12,
    },
    trendRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    trendValue: {
        fontSize: 14,
        fontWeight: "700",
    },
    summaryCardsContainer: {
        flexDirection: "row",
        gap: 12,
        marginTop: 16,
    },
    summaryCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    summaryCardLabel: {
        fontSize: 12,
        fontWeight: "500",
        marginBottom: 8,
    },
    summaryCardValue: {
        fontSize: 18,
        fontWeight: "700",
    },
    moreButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    moreButtonText: {
        fontSize: 12,
        fontWeight: "600",
    },
    moreInfoContainer: {
        marginTop: 16,
        gap: 12,
    },
    infoCardRow: {
        flexDirection: "row",
        gap: 12,
    },
    loadingContainer: {
        height: 220,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 13,
    },
    emptyContainer: {
        height: 220,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        fontWeight: "500",
        textAlign: "center",
    },
    errorContainer: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    errorText: {
        fontSize: 13,
        marginBottom: 8,
    },
    retryButton: {
        paddingVertical: 6,
    },
    retryText: {
        fontSize: 12,
        fontWeight: "600",
    },
    selectedInfoCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        backgroundColor: "#FFF"
    },
    selectedInfoContent: {
        flex: 1,
    },
    selectedInfoColumn: {
        flex: 1,
        flexDirection: "column",
        gap: 8,
    },
    selectedInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    selectedInfoLabel: {
        fontSize: 13,
        fontWeight: "500",
    },
    selectedInfoValue: {
        fontSize: 14,
        fontWeight: "600",
    },
    closeInfoButton: {
        padding: 4,
        marginLeft: 8,
    },
});