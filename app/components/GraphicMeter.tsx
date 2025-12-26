import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
    BarChart
} from "react-native-gifted-charts";

import { useTheme } from "../context/ThemeContext";

type PeriodFilter = "dia" | "semana" | "mes";

export default function GraphicMeter() {
    const { theme } = useTheme();
    const colors = theme.colors;
    const screenWidth = Dimensions.get("window").width;


    const [selectedPoint, setSelectedPoint] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState("");
    const [currentDate, setCurrentDate] = useState("");
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("dia");

    useEffect(() => {
        const interval = setInterval(() => {
            const agora = new Date();

            const dia = agora.getDate().toString().padStart(2, "0");
            const mes = (agora.getMonth() + 1).toString().padStart(2, "0");
            const hora = agora.toLocaleTimeString("pt-BR");

            setCurrentDate(`${dia}/${mes}`);
            setCurrentTime(hora);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    const horasDia = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    const diaLabelIndexes = new Set([0, 6, 12, 18, 23]);

    // Gerar dados estáveis baseados no período
    const baseData = useMemo(() => {
        const seed = periodFilter === "dia" ? 1 : periodFilter === "semana" ? 2 : 3;
        const random = (index: number) => {
            const x = Math.sin((seed + index) * 12.9898) * 43758.5453;
            return x - Math.floor(x);
        };

        switch (periodFilter) {
            case "dia":
                return horasDia.map((hora, index) => ({
                    value: Math.floor(random(index) * 25) + 5,
                    label: diaLabelIndexes.has(index) ? (index === 23 ? "23:59" : hora) : "",
                }));
            case "semana":
                return diasSemana.map((dia, index) => ({
                    value: Math.floor(random(index) * 30) + 5,
                    label: dia,
                }));
            case "mes":
                return meses.map((mes, index) => ({
                    value: Math.floor(random(index) * 30) + 5,
                    label: mes,
                }));
            default:
                return [];
        }
    }, [periodFilter]);

    // Aplicar seleção e tooltip aos dados base
    const liveData = useMemo(() => {
        return baseData.map((item, index) => {
            const isSelected = selectedPoint?.index === index;
            return {
                ...item,
                frontColor: isSelected ? colors.primaryLight || colors.primary : colors.primary,
                topLabelComponent: () => isSelected ? (
                    <View
                        style={[
                            styles.tooltipContainer,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text style={[styles.tooltipText, { color: colors.text }]}>
                            {item.value.toFixed(1)} kWh
                        </Text>
                    </View>
                ) : null,
            };
        });
    }, [baseData, selectedPoint, colors]);

    useEffect(() => {
        setSelectedPoint(null);
    }, [periodFilter]);

    const chartColor = colors.primary;

    const gridColor = colors.border;
    const axisColor = colors.border;

    // Calcular consumo médio
    const averageConsumption = liveData.length > 0
        ? (liveData.reduce((sum, item) => sum + item.value, 0) / liveData.length).toFixed(1)
        : "0.0";

    const getSpacing = () => {
        if (periodFilter === "dia") return 2;
        if (periodFilter === "semana") return 12;
        return 8;
    };

    const spacingValue = getSpacing();

    const getBarWidth = () => {
        if (periodFilter === "dia") return 6;
        if (periodFilter === "semana") return 18;
        return 12;
    };

    const barWidthValue = getBarWidth();

    const containerChartWidth = Math.min(screenWidth - 72, 460);
    const computedChartWidth =
        liveData.length * (barWidthValue + spacingValue) + 12 + 24 + 32;
    const chartWidth = Math.max(containerChartWidth, computedChartWidth);

    const FilterBadge = ({
        label,
        isActive,
        onPress
    }: {
        label: string;
        isActive: boolean;
        onPress: () => void;
    }) => (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.filterBadge,
                {
                    backgroundColor: isActive ? chartColor : colors.surface,
                    borderColor: isActive ? chartColor : colors.border,
                },
            ]}
        >
            <Text
                style={[
                    styles.filterBadgeText,
                    {
                        color: isActive ? colors.buttonText : colors.text,
                        fontWeight: isActive ? "600" : "400",
                    },
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.card, shadowColor: "#000" },
            ]}
        >
            <View style={styles.filterContainer}>
                <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
                    Período:
                </Text>
                <View style={styles.filterRow}>
                    <FilterBadge
                        label="Dia"
                        isActive={periodFilter === "dia"}
                        onPress={() => setPeriodFilter("dia")}
                    />
                    <FilterBadge
                        label="Semana"
                        isActive={periodFilter === "semana"}
                        onPress={() => setPeriodFilter("semana")}
                    />
                    <FilterBadge
                        label="Mês"
                        isActive={periodFilter === "mes"}
                        onPress={() => setPeriodFilter("mes")}
                    />
                </View>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
                Consumo Tempo Real
            </Text>
            <View
                style={[
                    styles.chartFrame,
                    {
                        backgroundColor: colors.surface,
                        borderColor: gridColor,
                    },
                ]}
            >
                <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}>
                    <BarChart
                        data={liveData}
                        barWidth={barWidthValue}
                        spacing={spacingValue}
                        initialSpacing={12}
                        endSpacing={24}
                        barBorderRadius={6}
                        frontColor={chartColor}
                        height={220}
                        width={chartWidth}
                        maxValue={30}
                        noOfSections={6}
                        yAxisLabelSuffix=""
                        rulesColor={gridColor}
                        rulesType="dashed"
                        rulesThickness={1}
                        yAxisColor={axisColor}
                        xAxisColor={axisColor}
                        xAxisThickness={1}
                        yAxisThickness={1}
                        yAxisLabelWidth={32}
                        yAxisTextStyle={{ color: colors.textSecondary, fontSize: 11 }}
                        xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 11 }}
                        xAxisLabelsHeight={20}
                        onPress={(item, index) => {
                            setSelectedPoint({ ...item, index });
                        }}
                    />
                </ScrollView>
            </View>
            <View style={styles.averageContainer}>
                <View style={[styles.averageCircle, { backgroundColor: colors.primary }]} />
                <Text style={[styles.averageText, { color: colors.text }]}>
                    Consumo Médio: {averageConsumption} kWh
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 10,
        margin: 1,
        width: "100%",
    },
    filterContainer: {
        marginBottom: 12,
    },
    filterLabel: {
        fontSize: 13,
        marginBottom: 8,
        fontWeight: "500",
    },
    filterRow: {
        flexDirection: "row",
        gap: 8,
    },
    filterBadge: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1.5,
        minWidth: 70,
        alignItems: "center",
    },
    filterBadgeText: {
        fontSize: 13,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        marginTop: 8,
        marginBottom: 10,
    },
    chartFrame: {
        borderRadius: 12,
        borderWidth: 1,
        paddingTop: 12,
        paddingBottom: 8,
        paddingRight: 12,
        overflow: "hidden",
    },
    selectedPointContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
    },
    selectedPointText: {
        fontSize: 15,
    },
    closeButton: {
        fontSize: 20,
        fontWeight: "bold",
        paddingHorizontal: 8,
    },
    pieChartContainer: {
        alignItems: "center",
        marginVertical: 20,
    },
    tooltipContainer: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        marginBottom: 4,
    },
    tooltipText: {
        fontSize: 12,
        fontWeight: "600",
    },
    averageContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
        paddingLeft: 4,
    },
    averageCircle: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    averageText: {
        fontSize: 13,
        fontWeight: "500",
    },
});
