import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface GlobalCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    color?: string;
    variant?: "default" | "large";
}

export default function GlobalCard({
    title,
    value,
    subtitle,
    icon,
    color = "#FFFFFF",
    variant = "default",
}: GlobalCardProps) {
    return (
        <View style={[styles.card, variant === "large" && styles.cardLarge]}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {icon && <Ionicons name={icon} size={20} color={color} />}
            </View>

            <Text style={[styles.value, { color }]}>{value}</Text>

            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#111827",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#1e293b",
        width: "100%",
    },

    cardLarge: {
        padding: 20,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    title: {
        color: "#e2e8f0",
        fontSize: 14,
    },

    value: {
        marginTop: 8,
        fontSize: 28,
        fontWeight: "bold",
    },

    subtitle: {
        marginTop: -4,
        fontSize: 13,
        color: "#64748b",
    },
});
