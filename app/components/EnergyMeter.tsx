import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useEnergyData } from "../hooks/useEnergyData";

interface EnergyMeterProps {
    pulseActive?: boolean;
}

const EnergyMeter: React.FC<EnergyMeterProps> = ({ pulseActive = false }) => {
    const { theme } = useTheme();
    const { data, loading, error } = useEnergyData();
    const [blinkAnim] = useState(new Animated.Value(1));
    const [displayValue, setDisplayValue] = useState(0.0);
    
    const colors = theme.colors;
    
    // Cores adaptativas para o display digital
    const displayTextColor = colors.primary;
    const displayBgColor = theme.mode === "light" 
        ? "#E5E7EB"
        : "#1E293B"; 
    const secondaryTextColor = theme.mode === "light" ? "#000000" : "#FFFFFF";

    // Smooth transition for the meter value
    useEffect(() => {
        if (data) {
            const targetValue = parseFloat(data.currentUsage.toFixed(1));
            const step = (targetValue - displayValue) / 10;
            
            const interval = setInterval(() => {
                setDisplayValue(prev => {
                    const newValue = prev + step;
                    if (Math.abs(targetValue - newValue) < 0.1) {
                        clearInterval(interval);
                        return targetValue;
                    }
                    return parseFloat(newValue.toFixed(1));
                });
            }, 30);
            
            return () => clearInterval(interval);
        }
    }, [data?.currentUsage]);

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
        <View style={[
            styles.container,
            {
                backgroundColor: colors.card,
                borderColor: colors.border,
            }
        ]}>
            <Text style={[styles.title, { color: colors.text }]}>
                MEDIDOR DE ENERGIA MONOFÁSICO
            </Text>

            {/* Display */}
            <View style={[
                styles.display,
                {
                    backgroundColor: displayBgColor,
                }
            ]}>
                <Text style={[
                    styles.displayText,
                    { color: displayTextColor }
                ]}>
                    {loading ? (
                        <ActivityIndicator color={displayTextColor} />
                    ) : error ? (
                        <Text style={{ color: colors.error, fontSize: 16 }}>Erro ao carregar</Text>
                    ) : (
                        displayValue.toFixed(1).padStart(8, "0")
                    )}
                </Text>
            </View>

            {/* Rodapé */}
            <View style={styles.footer}>
                <View style={styles.pulseContainer}>
                    <Text style={[styles.pulseLabel, { color: colors.text }]}>Pulso</Text>
                    <Animated.View
                        style={[
                            styles.pulseDot,
                            {
                                backgroundColor: pulseActive ? colors.error : colors.textTertiary,
                                opacity: pulseActive ? blinkAnim : 1,
                            }
                        ]}
                    />
                </View>

                <View style={styles.unitContainer}>
                    <Text style={[styles.unit, { color: secondaryTextColor }]}>
                        {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : '--:--'}
                    </Text>
                    <Text style={[styles.unit, { color: secondaryTextColor, marginLeft: 8 }]}>
                        {data ? 'kWh' : ''}
                    </Text>
                    <View style={[
                        styles.symbolBox,
                        { borderColor: colors.border }
                    ]}>
                        <Text style={[styles.symbolText, { color: secondaryTextColor }]}>+ −</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        padding: 10,
        alignItems: "center",
        width: "100%",
        alignSelf: "center",
        borderWidth: 2,
        marginBottom: 16,
    },
    title: {
        fontSize: 13,
        fontWeight: "700",
        marginBottom: 8,
    },
    display: {
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 10,
        marginBottom: 12,
        height: 100,
        width: 311,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
    },
    displayText: {
        fontFamily: "Digital",
        fontSize: 65,
        height: 80,
        letterSpacing: 3,
        textAlign: "center",
        textAlignVertical: "center",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingHorizontal: 10,
        alignItems: "center",
    },
    pulseContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    pulseLabel: {
        fontSize: 13,
        marginRight: 6,
    },
    pulseDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    unitContainer: {
        alignItems: "center",
    },
    unit: {
        fontSize: 13,
        fontWeight: "600",
    },
    symbolBox: {
        borderWidth: 1,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3,
        marginTop: 3,
    },
    symbolText: {
        fontSize: 10,
    },
});

export default EnergyMeter;
