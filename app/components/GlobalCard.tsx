import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

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
    color = "",
    variant = "default",
}: GlobalCardProps) {
    const { theme } = useTheme();
    const colors = theme.colors;

    // Cor prioritária → se não passar "color", usa colors.text primária
    const iconAndValueColor = color || colors.text;

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                },
                variant === "large" && styles.cardLarge,
            ]}
        >
            <View style={styles.header}>
                <Text
                    style={[
                        styles.title,
                        { color: colors.textSecondary },
                    ]}
                >
                    {title}
                </Text>

                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={iconAndValueColor}
                    />
                )}
            </View>

            <Text
                style={[
                    styles.value,
                    { color: iconAndValueColor },
                ]}
            >
                {value}
            </Text>

            {subtitle && (
                <Text
                    style={[
                        styles.subtitle,
                        { color: colors.textTertiary },
                    ]}
                >
                    {subtitle}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        flexGrow: 1,          
        flexShrink: 1,        
        flexBasis: "48%",     
        margin: 4,            
    },

    cardLarge: {
        padding: 20,
        flexBasis: '100%'
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    title: {
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
    },
});
