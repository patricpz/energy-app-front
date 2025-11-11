import React from "react";
import { StyleSheet, Text, View } from "react-native";
import EnergyMeter from "../components/EnergyMeter";
import GraphicMeter from "../components/GraphicMeter";
import Header from "../components/Header";
import { useTheme } from "../context/ThemeContext";

export default function Home() {
    const { theme } = useTheme();
    
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Header />

            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Home Screen</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                    Bem-vindo ao painel do EnergyPro ⚡
                </Text>
                <View style={{ alignItems: "center", marginTop: 20 }}>
                    <EnergyMeter pulseActive />
                </View>
                <View style={styles.sectionGraphic}>
                    <GraphicMeter />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
        padding: 16,
    }
});

