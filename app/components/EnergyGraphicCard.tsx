import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

export default function EnergyGraphCard() {
    const [period, setPeriod] = useState<"day" | "week" | "month" | "all">("month");
    const [solarEnabled, setSolarEnabled] = useState(true);

    // Dados exemplo — substitua pelos reais
    const monthData = [
        { value: 80, label: "Mar" },
        { value: 120, label: "Apr" },
        { value: 160, label: "May" },
        { value: 180, label: "Jun" },
    ];

    const periods = [
        { key: "day", label: "Day" },
        { key: "week", label: "Week" },
        { key: "month", label: "Month" },
        { key: "all", label: "All time" },
    ];

    return (
        <View style={styles.container}>
            
            {/* Título */}
            <Text style={styles.title}>Energy generated</Text>

            {/* Valor total */}
            <Text style={styles.bigValue}>30.276KWh</Text>

            {/* Badge de crescimento */}
            <Text style={styles.growthText}>
                ▲ 2 131Wh <Text style={{ color: "#4CAF50" }}>(14%)</Text>
            </Text>

            {/* Tabs */}
            <View style={styles.tabRow}>
                {periods.map((p) => {
                    const active = period === p.key;
                    return (
                        <TouchableOpacity
                            key={p.key}
                            onPress={() => setPeriod(p.key as any)}
                            style={styles.tabButton}
                        >
                            <Text style={[styles.tabText, active && styles.tabTextActive]}>
                                {p.label}
                            </Text>
                            {active && <View style={styles.tabUnderline} />}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Gráfico */}
            <LineChart
                data={monthData}
                curved
                areaChart
                startFillColor="#4CAF50"
                endFillColor="#4CAF50"
                startOpacity={0.25}
                endOpacity={0.05}
                color="#4CAF50"
                height={220}
                spacing={80}
                thickness={3}
                hideYAxisText={false}
                yAxisTextStyle={{ color: "#A4A4A4" }}
                xAxisLabelTextStyle={{ color: "#444" }}
                rulesColor="#EEE"
                rulesType="solid"
            />

            {/* Seletor Solar Power */}
            <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setSolarEnabled(!solarEnabled)}
            >
                <View style={[styles.checkbox, solarEnabled && styles.checkboxChecked]} />
                <Text style={styles.checkboxLabel}>Solar power</Text>
            </TouchableOpacity>

            {/* Cards finais */}
            <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>150KWh</Text>
                    <Text style={styles.summaryLabel}>Today</Text>
                </View>

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>165KWh</Text>
                    <Text style={styles.summaryLabel}>This month</Text>
                </View>

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>398KWh</Text>
                    <Text style={styles.summaryLabel}>All time</Text>
                </View>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFF",
        padding: 10,
        margin: 16,
        borderColor: "#000",
        borderWidth: 1,
    },
    title: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
    bigValue: {
        fontSize: 28,
        fontWeight: "700",
        textAlign: "center",
        marginTop: 8,
    },
    growthText: {
        textAlign: "center",
        color: "#4CAF50",
        marginTop: 4,
        fontWeight: "600",
    },

    tabRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 20,
        marginBottom: 10,
    },
    tabButton: {
        alignItems: "center",
    },
    tabText: {
        fontSize: 14,
        color: "#AAA",
        fontWeight: "500",
    },
    tabTextActive: {
        color: "#4CAF50",
    },
    tabUnderline: {
        width: 30,
        height: 2,
        backgroundColor: "#4CAF50",
        marginTop: 4,
        borderRadius: 2,
    },

    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: "#4CAF50",
        marginRight: 8,
    },
    checkboxChecked: {
        backgroundColor: "#4CAF50",
    },
    checkboxLabel: {
        fontSize: 14,
        color: "#444",
    },

    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 22,
    },
    summaryCard: {
        width: "31%",
        backgroundColor: "#F8F8F8",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: "700",
    },
    summaryLabel: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
    },
});
