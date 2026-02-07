import { StyleSheet } from "react-native";

export const homeStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
    },
    sectionGraphic: {
        marginTop: 20,
        padding: 0,
    },
    pulseRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingRight: 8,
    },
    cardRow: {
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    }
});