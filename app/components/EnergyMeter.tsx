import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface EnergyMeterProps {
    pulseActive?: boolean; // flag para o pulso vermelho piscar
}

const EnergyMeter: React.FC<EnergyMeterProps> = ({ pulseActive = false }) => {
    const [value, setValue] = useState(0.0);
    const [blinkAnim] = useState(new Animated.Value(1));

    // Simula o medidor aumentando lentamente
    useEffect(() => {
        const interval = setInterval(() => {
            setValue((prev) => parseFloat((prev + 0.1).toFixed(1)));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Piscar o pulso vermelho quando ativo
    useEffect(() => {
        if (pulseActive) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(blinkAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(blinkAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            blinkAnim.setValue(1);
        }
    }, [pulseActive]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>MEDIDOR DE ENERGIA MONOFÁSICO</Text>

            {/* Display */}
            <View style={styles.display}>
                <Text style={styles.displayText}>
                    {value.toFixed(1).padStart(8, "0")}
                </Text>
            </View>

            {/* Rodapé */}
            <View style={styles.footer}>
                <View style={styles.pulseContainer}>
                    <Text style={styles.pulseLabel}>Pulso</Text>
                    <Animated.View
                        style={[
                            styles.pulseDot,
                            pulseActive && { backgroundColor: "red", opacity: blinkAnim },
                        ]}
                    />
                </View>

                <View style={styles.unitContainer}>
                    <Text style={styles.unit}>kWh</Text>
                    <View style={styles.symbolBox}>
                        <Text style={styles.symbolText}>+ −</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#0D1117",
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
        width: "90%",
        alignSelf: "center",
    },
    title: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "700",
        marginBottom: 8,
    },
    display: {
        backgroundColor: "#1A1F27",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginBottom: 12,
        minWidth: 240,
    },
    displayText: {
        color: "#00FF87",
        fontFamily: "Digital",
        fontSize: 32,
        letterSpacing: 3,
        textAlign: "center",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingHorizontal: 10,
        alignItems: "center",
    },
    pulseContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    pulseLabel: {
        color: "#FFFFFF",
        fontSize: 13,
        marginRight: 6,
    },
    pulseDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#000",
    },
    unitContainer: {
        alignItems: "center",
    },
    unit: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600",
    },
    symbolBox: {
        borderWidth: 1,
        borderColor: "#FFFFFF",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3,
        marginTop: 3,
    },
    symbolText: {
        color: "#FFFFFF",
        fontSize: 10,
    },
});

export default EnergyMeter;
