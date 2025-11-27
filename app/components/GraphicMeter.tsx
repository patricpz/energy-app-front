import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
    BarChart,
    LineChart,
    PieChart
} from "react-native-gifted-charts";

import { useTheme } from "../context/ThemeContext";

type PeriodFilter = "dia" | "semana" | "mes";
type ChartType = "linha" | "barra" | "pizza";

export default function GraphicMeter() {
    const { theme } = useTheme();
    const colors = theme.colors;
    const screenWidth = Dimensions.get("window").width;


    const [selectedPoint, setSelectedPoint] = useState(null);
    const [currentTime, setCurrentTime] = useState("");
    const [currentDate, setCurrentDate] = useState("");
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("semana");
    const [chartType, setChartType] = useState<ChartType>("linha");

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
    const horasDia = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}h`);
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    // Dados baseados no filtro de período
    const getDataByPeriod = (period: PeriodFilter) => {
        switch (period) {
            case "dia":
                return horasDia.map((hora) => ({
                    value: Math.floor(Math.random() * 30) + 5,
                    label: hora,
                }));
            case "semana":
                return diasSemana.map((dia) => ({
                    value: Math.floor(Math.random() * 30) + 5,
                    label: dia,
                }));
            case "mes":
                return meses.map((mes) => ({
                    value: Math.floor(Math.random() * 30) + 5,
                    label: mes,
                }));
            default:
                return [];
        }
    };

    const [liveData, setLiveData] = useState(() => getDataByPeriod(periodFilter));

    // Atualização de valores em tempo real baseado no período
    // useEffect(() => {
    //     setLiveData(getDataByPeriod(periodFilter));

    //     const interval = setInterval(() => {
    //         setLiveData(getDataByPeriod(periodFilter));
    //     }, 3000); // Atualiza a cada 3 segundos

    //     return () => clearInterval(interval);
    // }, [periodFilter]);

    const chartColor = colors.primary;

    const getSpacing = () => {
        if (periodFilter === "dia") return 25;
        if (periodFilter === "semana") return 55;
        return 30; // mês
    };

    const spacingValue = getSpacing();

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

            <View style={styles.filterContainer}>
                <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
                    Gráfico:
                </Text>
                <View style={styles.filterRow}>
                    <FilterBadge
                        label="Linha"
                        isActive={chartType === "linha"}
                        onPress={() => setChartType("linha")}
                    />
                    <FilterBadge
                        label="Barra"
                        isActive={chartType === "barra"}
                        onPress={() => setChartType("barra")}
                    />
                    <FilterBadge
                        label="Pizza"
                        isActive={chartType === "pizza"}
                        onPress={() => setChartType("pizza")}
                    />
                </View>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
                Consumo Tempo Real
            </Text>

            {selectedPoint && (
                <View
                    style={[
                        styles.selectedPointContainer,
                        { backgroundColor: colors.surface },
                    ]}
                >
                    <Text style={[styles.selectedPointText, { color: colors.text }]}>
                        {selectedPoint.label}:{" "}
                        <Text style={{ color: chartColor, fontWeight: "600" }}>
                            {selectedPoint.value} kWh
                        </Text>
                    </Text>
                    <TouchableOpacity onPress={() => setSelectedPoint(null)}>
                        <Text style={[styles.closeButton, { color: colors.textSecondary }]}>
                            ✕
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {chartType === "linha" && (
                <LineChart
                    data={liveData}
                    curved
                    areaChart
                    adjustToWidth={true}
                    startFillColor={chartColor}
                    endFillColor={chartColor}
                    startOpacity={0.25}
                    endOpacity={0.05}
                    color={chartColor}

                    initialSpacing={0}
                    endSpacing={0}

                    spacing={(screenWidth - 32) / (liveData.length - 1)}

                    height={260}
                    thickness={1}
                    dataPointsHeight={12}
                    dataPointsWidth={12}
                    dataPointsColor={chartColor}
                    hideRules
                    xAxisLabelTextStyle={{
                        color: colors.textSecondary,
                        fontSize: 12,
                    }}
                    onPress={(item) => setSelectedPoint(item)}
                />



            )}

            {chartType === "barra" && (
                <BarChart
                    data={liveData}
                    barWidth={periodFilter === "dia" ? 20 : periodFilter === "semana" ? 28 : 25}
                    spacing={spacingValue}
                    barBorderRadius={6}
                    frontColor={chartColor}
                    height={220}
                    xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: periodFilter === "dia" ? 10 : 12 }}
                    onPress={(item) => setSelectedPoint(item)}
                />
            )}

            {chartType === "pizza" && (
                <View style={styles.pieChartContainer}>
                    <PieChart
                        data={liveData.map((d, index) => ({
                            value: d.value,
                            color: chartColor,
                            text: d.label,
                        }))}
                        donut
                        radius={90}
                        textColor={colors.text}
                        textSize={12}
                        focusOnPress
                        onPress={(item: any) => {
                            const point = liveData.find(d => d.value === item.value);
                            if (point) setSelectedPoint(point);
                        }}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 16,
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
});
