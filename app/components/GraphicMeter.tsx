import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
    BarChart
} from "react-native-gifted-charts";

import { useTheme } from "../context/ThemeContext";
import { EnergyDayData, EnergyHourData, EnergyMonthData, getEnergyDays, getEnergyHours, getEnergyMonths } from "../services/energyReport";

type PeriodFilter = "dia" | "semana" | "mes";

export default function GraphicMeter() {
    const { theme } = useTheme();
    const colors = theme.colors;
    const screenWidth = Dimensions.get("window").width;


    const [selectedPoint, setSelectedPoint] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState("");
    const [currentDate, setCurrentDate] = useState("");
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("dia");
    const [showMoreInfo, setShowMoreInfo] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiData, setApiData] = useState<EnergyHourData[] | EnergyDayData[] | EnergyMonthData[]>([]);

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

    // Função para buscar dados da API
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;
            const currentDay = now.getDate();

            switch (periodFilter) {
                case "dia":
                    // Buscar horas do dia atual usando a rota hierárquica
                    const hoursData = await getEnergyHours({
                        yearId: currentYear,
                        monthId: currentMonth,
                        dayId: currentDay,
                    });
                    setApiData(hoursData);
                    break;

                case "semana":
                    // Buscar últimos 7 dias usando a rota hierárquica
                    const weekAgo = new Date(now);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    
                    // Buscar dias do mês atual
                    const daysData = await getEnergyDays({
                        yearId: currentYear,
                        monthId: currentMonth,
                        startDate: weekAgo.toISOString().split('T')[0],
                        endDate: now.toISOString().split('T')[0],
                    });
                    setApiData(daysData);
                    break;

                case "mes":
                    // Buscar meses do ano atual usando a rota hierárquica
                    const monthsData = await getEnergyMonths({
                        yearId: currentYear,
                    });
                    setApiData(monthsData);
                    break;
            }
        } catch (err: any) {
            console.error('Error fetching energy data:', err);
            setError(err.message || 'Erro ao carregar dados');
            // Em caso de erro, usar dados vazios
            setApiData([]);
        } finally {
            setLoading(false);
        }
    };

    // Buscar dados quando o período mudar
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periodFilter]);

    // Atualização automática em tempo real (a cada 30 segundos para consumo do dia)
    useEffect(() => {
        if (periodFilter === "dia") {
            const interval = setInterval(() => {
                fetchData();
            }, 30000); // Atualiza a cada 30 segundos

            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periodFilter]);

    // Converter dados da API para o formato do gráfico
    const baseData = useMemo(() => {
        if (loading || apiData.length === 0) {
            // Retornar dados vazios enquanto carrega ou se não houver dados
            switch (periodFilter) {
                case "dia":
                    return horasDia.map((hora, index) => {
                        let label = "";
                        if (index === 0) label = "00:00";
                        else if (index === 6) label = "06:00";
                        else if (index === 12) label = "12:00";
                        else if (index === 18) label = "18:00";
                        else if (index === 23) label = "23:59";
                        return { value: 0, label, hour: hora };
                    });
                case "semana":
                    return diasSemana.map((dia) => ({ value: 0, label: dia }));
                case "mes":
                    return meses.map((mes) => ({ value: 0, label: mes }));
                default:
                    return [];
            }
        }

        switch (periodFilter) {
            case "dia":
                // Mapear dados de horas
                const hoursData = apiData as EnergyHourData[];
                // Criar um mapa de hora -> consumo
                const hourMap = new Map<number, number>();
                hoursData.forEach((item) => {
                    // Usar consumption se disponível, senão usar totalConsumption ou averageConsumption
                    const consumptionValue = item.consumption || (item as any).totalConsumption || (item as any).averageConsumption || 0;
                    hourMap.set(item.hour, consumptionValue);
                });
                
                return horasDia.map((hora, index) => {
                    const consumption = hourMap.get(index) || 0;
                    let label = "";
                    if (index === 0) label = "00:00";
                    else if (index === 6) label = "06:00";
                    else if (index === 12) label = "12:00";
                    else if (index === 18) label = "18:00";
                    else if (index === 23) label = "23:59";
                    
                    return {
                        value: consumption,
                        label,
                        hour: hora,
                    };
                });

            case "semana":
                // Mapear dados de dias
                const daysData = apiData as EnergyDayData[];
                // Ordenar por data e pegar últimos 7 dias
                const sortedDays = daysData
                    .sort((a, b) => {
                        const dateA = new Date(a.year, a.month - 1, a.day);
                        const dateB = new Date(b.year, b.month - 1, b.day);
                        return dateA.getTime() - dateB.getTime();
                    })
                    .slice(-7);
                
                // Garantir que temos 7 dias (preencher com zeros se necessário)
                const weekData = Array.from({ length: 7 }, (_, index) => {
                    const dayData = sortedDays[index];
                    if (dayData) {
                        const date = new Date(dayData.year, dayData.month - 1, dayData.day);
                        const dayOfWeek = date.getDay();
                        const dayName = diasSemana[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
                        
                        return {
                            value: dayData.totalConsumption || dayData.averageConsumption || 0,
                            label: dayName,
                        };
                    } else {
                        // Preencher com dia da semana se não houver dados
                        const today = new Date();
                        const targetDate = new Date(today);
                        targetDate.setDate(today.getDate() - (6 - index));
                        const dayOfWeek = targetDate.getDay();
                        const dayName = diasSemana[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
                        
                        return {
                            value: 0,
                            label: dayName,
                        };
                    }
                });
                
                return weekData;

            case "mes":
                // Mapear dados de meses
                const monthsData = apiData as EnergyMonthData[];
                return monthsData.map((item) => {
                    const monthIndex = item.month - 1;
                    const monthName = meses[monthIndex] || `Mês ${item.month}`;
                    
                    return {
                        value: item.totalConsumption || item.averageConsumption || 0,
                        label: monthName,
                    };
                });

            default:
                return [];
        }
    }, [apiData, periodFilter, loading]);

    const liveData = useMemo(() => {
        return baseData.map((item, index) => {
            const isSelected = selectedPoint?.index === index;
            const hourLabel = (item as any).hour || item.label || `${index}:00`;
            
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
                        {periodFilter === "dia" && (
                            <Text style={[styles.tooltipHour, { color: colors.textSecondary }]}>
                                {hourLabel}
                            </Text>
                        )}
                    </View>
                ) : null,
            };
        });
    }, [baseData, selectedPoint, colors, periodFilter]);

    useEffect(() => {
        setSelectedPoint(null);
    }, [periodFilter]);

    // Função para lidar com o clique na barra
    const handleBarPress = (item: any, index: number) => {
        // Se clicar na mesma barra, deseleciona
        if (selectedPoint?.index === index) {
            setSelectedPoint(null);
        } else {
            // Seleciona a nova barra
            setSelectedPoint({ 
                ...item, 
                index,
                value: item.value,
            });
        }
    };

    const chartColor = colors.primary;

    const gridColor = colors.border;
    const axisColor = colors.border;

    // Calcular métricas
    const averageConsumption = liveData.length > 0
        ? (liveData.reduce((sum, item) => sum + item.value, 0) / liveData.length).toFixed(1)
        : "0.0";
    
    const maxConsumption = liveData.length > 0
        ? Math.max(...liveData.map(item => item.value)).toFixed(1)
        : "0.0";
    
    // Calcular eficiência (baseado em um valor ideal de 28 kWh)
    const efficiency = liveData.length > 0
        ? Math.max(0, Math.min(100, Math.floor((28 / parseFloat(averageConsumption)) * 100)))
        : 0;
    
    // Calcular impacto nos custos (assumindo R$ 0.40 por kWh)
    const costImpact = (parseFloat(averageConsumption) * 0.40).toFixed(2);
    
    // Análise de tendências (simulado: -2.2% vs mês passado)
    const trendAnalysis = "-2.2%";

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
            
            {error && (
                <View style={[styles.errorContainer, { backgroundColor: colors.error + "20" }]}>
                        <Text style={[styles.retryText, { color: colors.primary }]}>Sem relatorio no momento</Text>
                </View>
            )}

            <View
                style={[
                    styles.chartFrame,
                    {
                        backgroundColor: colors.surface,
                        borderColor: gridColor,
                    },
                ]}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                            Carregando dados...
                        </Text>
                    </View>
                ) : apiData.length === 0 && !error ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="battery-dead-outline" size={48} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            Não há consumo no momento
                        </Text>
                    </View>
                ) : (
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
                            maxValue={liveData.length > 0 
                                ? Math.ceil(Math.max(...liveData.map(item => item.value), 0) * 1.1) || 30
                                : 30}
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
                            onPress={handleBarPress}
                        />
                    </ScrollView>
                )}
            </View>
            <View style={styles.averageContainer}>
                <View style={[styles.averageCircle, { backgroundColor: colors.primary }]} />
                <Text style={[styles.averageText, { color: colors.text }]}>
                    Consumo Médio: {averageConsumption} kWh
                </Text>
                <TouchableOpacity
                    onPress={() => setShowMoreInfo(!showMoreInfo)}
                    style={styles.moreButton}
                >
                    <Text style={[styles.moreButtonText, { color: colors.primary }]}>
                        {showMoreInfo ? "Ocultar" : "Exibir mais"}
                    </Text>
                    <Ionicons
                        name={showMoreInfo ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={colors.primary}
                    />
                </TouchableOpacity>
            </View>

            {/* Cards de informações adicionais */}
            {showMoreInfo && (
                <View style={styles.moreInfoContainer}>
                    {/* Primeira linha: Análise de tendências (largura total) */}
                    <View style={[styles.infoCard, styles.infoCardFull, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.infoCardHeader}>
                            <Text style={[styles.infoCardTitle, { color: colors.textSecondary }]}>
                                Análise de tendências
                            </Text>
                            <Ionicons name="trending-down-outline" size={20} color={colors.success} />
                        </View>
                        <Text style={[styles.infoCardSubtitle, { color: colors.textTertiary }]}>
                            vs Mês Passado
                        </Text>
                        <Text style={[styles.infoCardValue, { color: colors.success }]}>
                            {trendAnalysis}
                        </Text>
                    </View>

                    {/* Segunda linha: Uso médio e Uso máximo */}
                    <View style={styles.infoCardRow}>
                        <View style={[styles.infoCard, styles.infoCardHalf, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <View style={styles.infoCardHeader}>
                                <Text style={[styles.infoCardTitle, { color: colors.textSecondary }]}>
                                    Uso médio
                                </Text>
                                <Ionicons name="stats-chart" size={20} color={colors.primary} />
                            </View>
                            <Text style={[styles.infoCardValue, { color: colors.primary }]}>
                                {averageConsumption} kWh
                            </Text>
                        </View>

                        <View style={[styles.infoCard, styles.infoCardHalf, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <View style={styles.infoCardHeader}>
                                <Text style={[styles.infoCardTitle, { color: colors.textSecondary }]}>
                                    Uso máximo
                                </Text>
                                <Ionicons name="flash" size={20} color={colors.warning} />
                            </View>
                            <Text style={[styles.infoCardValue, { color: colors.warning }]}>
                                {maxConsumption} kWh
                            </Text>
                        </View>
                    </View>

                    {/* Terceira linha: Eficiência e Impacto nos custos */}
                    <View style={styles.infoCardRow}>
                        <View style={[styles.infoCard, styles.infoCardHalf, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <View style={styles.infoCardHeader}>
                                <Text style={[styles.infoCardTitle, { color: colors.textSecondary }]}>
                                    Eficiência
                                </Text>
                                <Ionicons name="leaf-outline" size={20} color={colors.success} />
                            </View>
                            <Text style={[styles.infoCardValue, { color: colors.success }]}>
                                {efficiency}%
                            </Text>
                        </View>

                        <View style={[styles.infoCard, styles.infoCardHalf, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <View style={styles.infoCardHeader}>
                                <Text style={[styles.infoCardTitle, { color: colors.textSecondary }]}>
                                    Impacto nos custos
                                </Text>
                                <Ionicons name="cash-outline" size={20} color={colors.text} />
                            </View>
                            <Text style={[styles.infoCardValue, { color: colors.text }]}>
                                R$ {costImpact}
                            </Text>
                        </View>
                    </View>
                </View>
            )}
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
    tooltipHour: {
        fontSize: 10,
        marginTop: 2,
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
        flex: 1,
    },
    moreButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    moreButtonText: {
        fontSize: 12,
        fontWeight: "600",
    },
    moreInfoContainer: {
        marginTop: 16,
        gap: 12,
    },
    infoCardRow: {
        flexDirection: "row",
        gap: 12,
    },
    infoCard: {
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
    },
    infoCardFull: {
        width: "100%",
    },
    infoCardHalf: {
        flex: 1,
    },
    infoCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    infoCardTitle: {
        fontSize: 13,
        fontWeight: "500",
    },
    infoCardSubtitle: {
        fontSize: 11,
        marginBottom: 4,
    },
    infoCardValue: {
        fontSize: 18,
        fontWeight: "700",
    },
    loadingContainer: {
        height: 220,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 13,
    },
    emptyContainer: {
        height: 220,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        fontWeight: "500",
        textAlign: "center",
    },
    errorContainer: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    errorText: {
        fontSize: 13,
        marginBottom: 8,
    },
    retryButton: {
        paddingVertical: 6,
    },
    retryText: {
        fontSize: 12,
        fontWeight: "600",
    },
});
