import React from "react";
import { StyleSheet, Text, View } from "react-native";
import EnergyMeter from "../components/EnergyMeter";
import Header from "../components/Header";

export default function Home() {
    return (
        <View style={styles.container}>
            <Header />

            <View style={styles.content}>
                <Text style={styles.title}>Home Screen</Text>
                <Text style={styles.subtitle}>
                    Bem-vindo ao painel do EnergyPro ⚡
                </Text>
                <View style={{ alignItems: "center", marginTop: 40 }}>
                    <EnergyMeter pulseActive />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0D1117",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 24,
        color: "#FFFFFF",
        fontWeight: "600",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: "#8A99A6",
    },
});

