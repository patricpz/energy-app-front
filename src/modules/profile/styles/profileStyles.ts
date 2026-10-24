import { StyleSheet } from "react-native";

export const profileStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "600",
    },
    headerActions: {
        flexDirection: "row",
        gap: 16,
        alignItems: "center",
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
    themeToggle: {
        padding: 4,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
    },
    profileSection: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    profileImageContainer: {
        position: "relative",
        marginRight: 16,
    },
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: "center",
        justifyContent: "center",
    },
    editIcon: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        marginBottom: 2,
    },
    userPhone: {
        fontSize: 13,
        opacity: 0.8,
    },
    metricsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingTop: 20,
        borderTopWidth: 1,
    },
    metric: {
        alignItems: "center",
    },
    metricValue: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 4,
    },
    metricLabel: {
        fontSize: 13,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 16,
    },
    goalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    goalLabel: {
        fontSize: 14,
    },
    goalValue: {
        fontSize: 16,
        fontWeight: "600",
    },
    progressBarContainer: {
        marginBottom: 12,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 4,
    },
    progressInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    progressText: {
        fontSize: 13,
    },
    updateButton: {
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
    },
    updateButtonText: {
        fontSize: 14,
        fontWeight: "600",
    },
    notificationItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    notificationContent: {
        flex: 1,
        marginRight: 16,
    },
    notificationTitle: {
        fontSize: 15,
        fontWeight: "500",
        marginBottom: 4,
    },
    notificationDescription: {
        fontSize: 12,
    },
    signOutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        paddingVertical: 16,
    },
    signOutText: {
        fontSize: 16,
        fontWeight: "500",
        marginLeft: 8,
    },
});