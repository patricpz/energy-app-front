import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import EnergyMeter from "../components/EnergyMeter";
import AppCard from "../components/GlobalCard";
import GraphicMeter from "../components/GraphicMeter";
import Header from "../components/Header";
import PulseWebSocketLed from "../components/PulseWebSocketLed";
import { useTheme } from "../context/ThemeContext";
import SafeScreen from "../SafeScreen";

export default function Home() {
    const { theme } = useTheme();
    const [pulseActive, setPulseActive] = useState(false);

    return (
        <SafeScreen>
            <ScrollView>
                <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                    <Header />

                    <View style={styles.content}>
                        <View style={styles.pulseRow}>
                            <PulseWebSocketLed
                                onPulse={() => {
                                    setPulseActive(true);
                                    setTimeout(() => setPulseActive(false), 150);
                                }}
                            />
                        </View>

                        <View style={{ alignItems: "center", marginTop: 20 }}>
                            <EnergyMeter pulseActive={pulseActive} />
                        </View>
                        <View>
                            <AppCard
                                title="Consumo Total"
                                value="156.8"
                                subtitle="kWh"
                                icon="flash"
                                color="#facc15"
                            />
                        </View>
                        <View style={styles.sectionGraphic}>
                            <GraphicMeter />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeScreen>
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
    },
    pulseRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingRight: 8,
    },
});
