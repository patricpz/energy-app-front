import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
    BarChart
} from "react-native-gifted-charts";

import { useTheme } from "../context/ThemeContext";
import { EnergyDayData, EnergyHourData, EnergyMonthData, getEnergyDays, getEnergyHours, getEnergyMonths } from "../services/energyReport";

type PeriodFilter = "dia" | "semana" | "mes" | "ano";

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
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

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

    const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex"];
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const horasDia = [0, 6, 12, 18];


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
                    // Buscar segunda a sexta da semana atual
                    const today = new Date(now);
                    const dayOfWeek = today.getDay(); // 0 = domingo, 1 = segunda, etc.
                    // Calcular quantos dias voltar para chegar na segunda-feira
                    // Se domingo (0), volta 6 dias; se segunda (1), volta 0 dias; se terça (2), volta 1 dia, etc.
                    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                    const monday = new Date(today);
                    monday.setDate(today.getDate() - daysToMonday);
                    const friday = new Date(monday);
                    friday.setDate(monday.getDate() + 4); // Sexta-feira (segunda + 4 dias)
                    
                    // Buscar dias de segunda a sexta
                    const daysData = await getEnergyDays({
                        yearId: monday.getFullYear(),
                        monthId: monday.getMonth() + 1,
                        startDate: monday.toISOString().split('T')[0],
                        endDate: friday.toISOString().split('T')[0],
                    });
                    setApiData(daysData);
                    break;

                case "mes":
                    // Buscar todos os dias do mês selecionado
                    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
                    const monthDaysData = await getEnergyDays({
                        yearId: selectedYear,
                        monthId: selectedMonth,
                        startDay: 1,
                        endDay: daysInMonth,
                    });
                    setApiData(monthDaysData);
                    break;

                case "ano":
                    // Buscar todos os meses do ano selecionado
                    const monthsData = await getEnergyMonths({
                        yearId: selectedYear,
                        startMonth: 1,
                        endMonth: 12,
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

    // Buscar dados quando o período, ano ou mês mudar
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periodFilter, selectedYear, selectedMonth]);

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
                    return horasDia.map((hora) => ({
                        value: 0,
                        label: `${hora.toString().padStart(2, "0")}:00`,
                        hour: hora,
                    }));
                case "semana":
                    return diasSemana.map((dia) => ({ value: 0, label: dia }));
                case "mes":
                    // Retornar dias do mês (1 até último dia)
                    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
                    return Array.from({ length: daysInMonth }, (_, i) => ({
                        value: 0,
                        label: (i + 1).toString(),
                    }));
                case "ano":
                    return meses.map((mes) => ({ value: 0, label: mes }));
                default:
                    return [];
            }
        }

        switch (periodFilter) {
            case "dia":
                // Mapear dados de horas (apenas 00:00, 06:00, 12:00, 18:00)
                const hoursData = apiData as EnergyHourData[];
                const hourMap = new Map<number, number>();
                hoursData.forEach((item) => {
                    const consumptionValue = item.consumption || (item as any).expenseKwh || (item as any).totalConsumption || (item as any).averageConsumption || 0;
                    hourMap.set(item.hour, consumptionValue);
                });
                
                return horasDia.map((hora) => {
                    const consumption = hourMap.get(hora) || 0;
                    return {
                        value: consumption,
                        label: `${hora.toString().padStart(2, "0")}:00`,
                        hour: hora,
                    };
                });

            case "semana":
                // Mapear dados de dias (segunda a sexta)
                const daysData = apiData as EnergyDayData[];
                const sortedDays = daysData
                    .sort((a, b) => {
                        const dateA = new Date(a.year, a.month - 1, a.day);
                        const dateB = new Date(b.year, b.month - 1, b.day);
                        return dateA.getTime() - dateB.getTime();
                    })
                    .slice(-5); // Pegar últimos 5 dias
                
                // Garantir que temos 5 dias (segunda a sexta)
                const weekData = Array.from({ length: 5 }, (_, index) => {
                    const dayData = sortedDays[index];
                    if (dayData) {
                        const consumptionValue = (dayData as any).expenseKwh || dayData.totalConsumption || dayData.averageConsumption || 0;
                        return {
                            value: consumptionValue,
                            label: diasSemana[index],
                        };
                    } else {
                        return {
                            value: 0,
                            label: diasSemana[index],
                        };
                    }
                });
                
                return weekData;

            case "mes":
                // Mapear dados de dias do mês
                const monthDaysData = apiData as EnergyDayData[];
                const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
                const dayMap = new Map<number, number>();
                
                console.log('Mapping month days data:', monthDaysData);
                console.log('Selected month:', selectedMonth, 'Days in month:', daysInMonth);
                
                monthDaysData.forEach((item) => {
                    const consumptionValue = (item as any).expenseKwh || item.totalConsumption || item.averageConsumption || 0;
                    console.log(`Day ${item.day}: consumptionValue = ${consumptionValue}`);
                    dayMap.set(item.day, consumptionValue);
                });
                
                const result = Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const value = dayMap.get(day) || 0;
                    return {
                        value: value,
                        label: day.toString(),
                    };
                });
                
                console.log('Mapped result for month:', result);
                return result;

            case "ano":
                // Mapear dados de meses do ano
                const monthsData = apiData as EnergyMonthData[];
                const monthMap = new Map<number, number>();
                
                monthsData.forEach((item) => {
                    const consumptionValue = (item as any).expenseKwh || item.totalConsumption || item.averageConsumption || 0;
                    monthMap.set(item.month, consumptionValue);
                });
                
                return meses.map((mesNome, index) => {
                    const month = index + 1;
                    return {
                        value: monthMap.get(month) || 0,
                        label: mesNome,
                    };
                });

            default:
                return [];
        }
    }, [apiData, periodFilter, loading, selectedYear, selectedMonth]);

    const liveData = useMemo(() => {
        return baseData.map((item, index) => {
            const isSelected = selectedPoint?.index === index;
            const hourLabel = (item as any).hour || item.label || `${index}:00`;
            const hasValue = item.value > 0;
            
            return {
                ...item,
                frontColor: isSelected ? colors.primaryLight || colors.primary : colors.primary,
                topLabelComponent: () => (isSelected && hasValue) ? (
                    <View
                        style={[
                            styles.tooltipContainer,
                            {
                                backgroundColor: "#FFFFFF",
                                borderColor: "#E0E0E0",
                            },
                        ]}
                    >
                        <Text style={[styles.tooltipText, { color: "#000000" }]}>
                            {item.value.toFixed(3)} kWh
                        </Text>
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
    
    const minConsumption = liveData.length > 0
        ? (() => {
            const validValues = liveData.map(item => item.value).filter(val => val > 0);
            return validValues.length > 0 ? Math.min(...validValues).toFixed(1) : "0.0";
        })()
        : "0.0";
    
    const totalConsumption = liveData.length > 0
        ? liveData.reduce((sum, item) => sum + item.value, 0).toFixed(1)
        : "0.0";
    
    // Consumo atual (último valor ou média)
    const currentConsumption = liveData.length > 0
        ? (liveData[liveData.length - 1]?.value || parseFloat(averageConsumption)).toFixed(1)
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
        if (periodFilter === "dia") return 8;
        if (periodFilter === "semana") return 12;
        if (periodFilter === "mes") return 2;
        return 8; // ano
    };

    const spacingValue = getSpacing();

    const getBarWidth = () => {
        if (periodFilter === "dia") return 20;
        if (periodFilter === "semana") return 18;
        if (periodFilter === "mes") return 6;
        return 12; // ano
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
            {/* Header com título e informações */}
            <View style={styles.headerContainer}>
                <View style={styles.headerTop}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        Consumo Tempo Real
                    </Text>
                </View>
                {periodFilter === "dia" && (
                    <View style={styles.lastUpdateRow}>
                        <Text style={[styles.lastUpdateLabel, { color: colors.textSecondary }]}>
                            Última atualização: {currentTime}
                        </Text>
                    </View>
                )}
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
                    <FilterBadge
                        label="Ano"
                        isActive={periodFilter === "ano"}
                        onPress={() => setPeriodFilter("ano")}
                    />
                </View>
            </View>
            
            {/* Seletor de ano quando o filtro for "ano" ou "mes" */}
            {(periodFilter === "ano" || periodFilter === "mes") && (
                <View style={styles.yearSelectorContainer}>
                    <Text style={[styles.yearSelectorLabel, { color: colors.textSecondary }]}>
                        {periodFilter === "ano" ? "Ano:" : "Ano/Mês:"}
                    </Text>
                    <View style={styles.yearSelectorRow}>
                        <TouchableOpacity
                            onPress={() => {
                                if (periodFilter === "ano") {
                                    setSelectedYear(selectedYear - 1);
                                } else {
                                    if (selectedMonth === 1) {
                                        setSelectedYear(selectedYear - 1);
                                        setSelectedMonth(12);
                                    } else {
                                        setSelectedMonth(selectedMonth - 1);
                                    }
                                }
                            }}
                            style={[styles.yearSelectorButton, { borderColor: colors.border }]}
                        >
                            <Ionicons name="chevron-back" size={20} color={colors.text} />
                        </TouchableOpacity>
                        
                        <View style={[styles.yearSelectorValue, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[styles.yearSelectorText, { color: colors.text }]}>
                                {periodFilter === "ano" 
                                    ? selectedYear.toString()
                                    : `${meses[selectedMonth - 1]}/${selectedYear}`
                                }
                            </Text>
                        </View>
                        
                        <TouchableOpacity
                            onPress={() => {
                                const currentYear = new Date().getFullYear();
                                const currentMonth = new Date().getMonth() + 1;
                                
                                if (periodFilter === "ano") {
                                    if (selectedYear < currentYear) {
                                        setSelectedYear(selectedYear + 1);
                                    }
                                } else {
                                    if (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth)) {
                                        if (selectedMonth === 12) {
                                            setSelectedYear(selectedYear + 1);
                                            setSelectedMonth(1);
                                        } else {
                                            setSelectedMonth(selectedMonth + 1);
                                        }
                                    }
                                }
                            }}
                            style={[
                                styles.yearSelectorButton, 
                                { borderColor: colors.border },
                                periodFilter === "ano" && selectedYear >= new Date().getFullYear() && { opacity: 0.5 },
                                periodFilter === "mes" && selectedYear >= new Date().getFullYear() && selectedMonth >= new Date().getMonth() + 1 && { opacity: 0.5 }
                            ]}
                            disabled={
                                periodFilter === "ano" 
                                    ? selectedYear >= new Date().getFullYear()
                                    : selectedYear >= new Date().getFullYear() && selectedMonth >= new Date().getMonth() + 1
                            }
                        >
                            <Ionicons name="chevron-forward" size={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            
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
                            maxValue={(() => {
                                if (liveData.length === 0) return 0.01;
                                const maxVal = Math.max(...liveData.map(item => item.value), 0);
                                // Se o valor máximo for muito pequeno, usar um mínimo de 0.01 para visualização
                                return maxVal > 0 ? Math.max(maxVal * 1.1, 0.01) : 0.01;
                            })()}
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

            {/* Consumo Médio com botão para expandir */}
            <View style={styles.averageContainer}>
                <View style={styles.averageLeft}>
                    <View style={[styles.averageCircle, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.averageText, { color: colors.text }]}>
                        Consumo Médio: {averageConsumption} kWh
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => setShowMoreInfo(!showMoreInfo)}
                    style={styles.expandButton}
                >
                    <Text style={[styles.expandButtonText, { color: colors.primary }]}>
                        {showMoreInfo ? "Ocultar" : "Exibir mais"}
                    </Text>
                    <Ionicons
                        name={showMoreInfo ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={colors.primary}
                    />
                </TouchableOpacity>
            </View>

            {/* Painel de informações adicionais (aparece quando expandido) */}
            {showMoreInfo && periodFilter === "dia" && (
                <View style={[styles.expandedInfoContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {/* Consumo Atual Grande */}
                    <View style={styles.currentConsumptionContainer}>
                        <Text style={[styles.currentConsumptionValue, { color: colors.text }]}>
                            {currentConsumption}
                        </Text>
                        <Text style={[styles.currentConsumptionLabel, { color: colors.textSecondary }]}>
                            kWh atual
                        </Text>
                    </View>

                    {/* Linha de Tendência */}
                    <View style={styles.trendContainer}>
                        <View style={styles.trendLeft}>
                            <View style={[styles.trendCircle, { backgroundColor: colors.primary }]} />
                            <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>
                                Consumo Atual
                            </Text>
                        </View>
                        <View style={[styles.trendLine, { backgroundColor: colors.primary + "40" }]} />
                        <View style={styles.trendRight}>
                            <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>
                                Tendência
                            </Text>
                            <Text style={[styles.trendValue, { color: colors.text }]}>
                                {currentConsumption} kWh
                            </Text>
                        </View>
                    </View>

                    {/* Cards de Resumo */}
                    <View style={styles.summaryCardsContainer}>
                        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={[styles.summaryCardLabel, { color: colors.textSecondary }]}>
                                Pico Hoje
                            </Text>
                            <Text style={[styles.summaryCardValue, { color: colors.text }]}>
                                {maxConsumption} kWh
                            </Text>
                        </View>
                        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={[styles.summaryCardLabel, { color: colors.textSecondary }]}>
                                Mínimo Hoje
                            </Text>
                            <Text style={[styles.summaryCardValue, { color: colors.text }]}>
                                {minConsumption} kWh
                            </Text>
                        </View>
                        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={[styles.summaryCardLabel, { color: colors.textSecondary }]}>
                                Total Hoje
                            </Text>
                            <Text style={[styles.summaryCardValue, { color: colors.text }]}>
                                {totalConsumption} kWh
                            </Text>
                        </View>
                    </View>
                </View>
            )}

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
    headerContainer: {
        flexDirection: "column",
        marginBottom: 12,
    },
    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
    },
    headerInfoRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerLabel: {
        fontSize: 13,
        fontWeight: "500",
    },
    headerValue: {
        fontSize: 13,
        fontWeight: "600",
    },
    activeFilterRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    activeIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    activeFilterText: {
        fontSize: 12,
        fontWeight: "500",
    },
    activeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    activeBadgeText: {
        fontSize: 11,
        fontWeight: "700",
    },
    lastUpdateRow: {
        marginBottom: 8,
    },
    lastUpdateLabel: {
        fontSize: 11,
        fontWeight: "400",
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
    yearSelectorContainer: {
        marginTop: 12,
    },
    yearSelectorLabel: {
        fontSize: 13,
        marginBottom: 8,
        fontWeight: "500",
    },
    yearSelectorRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    yearSelectorButton: {
        padding: 8,
        borderRadius: 8,
        borderWidth: 1.5,
        justifyContent: "center",
        alignItems: "center",
    },
    yearSelectorValue: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1.5,
        alignItems: "center",
    },
    yearSelectorText: {
        fontSize: 14,
        fontWeight: "600",
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
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
        minWidth: 80,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tooltipText: {
        fontSize: 14,
        fontWeight: "600",
    },
    currentConsumptionContainer: {
        alignItems: "center",
        marginVertical: 20,
    },
    currentConsumptionValue: {
        fontSize: 48,
        fontWeight: "700",
        marginBottom: 4,
    },
    currentConsumptionLabel: {
        fontSize: 14,
        fontWeight: "400",
    },
    averageContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 12,
        paddingLeft: 4,
    },
    averageLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
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
    expandButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    expandButtonText: {
        fontSize: 12,
        fontWeight: "600",
    },
    expandedInfoContainer: {
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    trendContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
        marginBottom: 16,
    },
    trendLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    trendCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    trendLabel: {
        fontSize: 12,
        fontWeight: "500",
    },
    trendLine: {
        flex: 1,
        height: 2,
        marginHorizontal: 12,
    },
    trendRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    trendValue: {
        fontSize: 14,
        fontWeight: "700",
    },
    summaryCardsContainer: {
        flexDirection: "row",
        gap: 12,
        marginTop: 16,
    },
    summaryCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    summaryCardLabel: {
        fontSize: 12,
        fontWeight: "500",
        marginBottom: 8,
    },
    summaryCardValue: {
        fontSize: 18,
        fontWeight: "700",
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
