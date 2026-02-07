import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Dimensions, Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "../context/ThemeContext";
import { EnergyDayData, EnergyHourData, EnergyMonthData, EnergyYearData, getEnergyDays, getEnergyMonths } from "../services/energyReport";
import EnergyBarChart from "./EnergyBarChart";
import GlobalCard from "./GlobalCard";
import { styles } from "./styles/stylesGraphicMeter";

type PeriodFilter = "dia" | "semana" | "mes" | "ano";

export default function GraphicMeter() {
    const { theme } = useTheme();
    const colors = theme.colors;
    const screenWidth = Dimensions.get("window").width;

    const [selectedPoint, setSelectedPoint] = useState<any>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [currentTime, setCurrentTime] = useState("");
    const [currentDate, setCurrentDate] = useState("");
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("dia");
    const [showMoreInfo, setShowMoreInfo] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiData, setApiData] = useState<EnergyHourData[] | EnergyDayData[] | EnergyMonthData[] | EnergyYearData[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [monthlyConsumption, setMonthlyConsumption] = useState<number>(0);

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

    const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const horasDia = Array.from({ length: 24 }, (_, i) => i);


    const fetchData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;
            
            const unwrap = (response: any) => {
                if (response && response.data && Array.isArray(response.data)) return response.data;
                if (Array.isArray(response)) return response;
                return [];
            };

            try {
                const monthDataArray = await getEnergyMonths({
                    year: currentYear,
                    startMonth: currentMonth,
                    endMonth: currentMonth,
                });
                if (monthDataArray && monthDataArray.length > 0) {
                    const monthData = monthDataArray[0];
                    const expenseKwh = (monthData as any).expenseKwh || monthData.consumeKwh || 0;
                    setMonthlyConsumption(typeof expenseKwh === 'number' ? expenseKwh : parseFloat(expenseKwh) || 0);
                } else {
                    setMonthlyConsumption(0);
                }
            } catch (err) {
                console.error('Erro ao buscar consumo do mês:', err);
                setMonthlyConsumption(0);
            }

            switch (periodFilter) {
                case "dia":
                    const today = new Date(now);
                    const currentYearForDay = today.getFullYear();
                    const currentMonthForDay = today.getMonth() + 1;
                    const currentDayForDay = today.getDate();
                    
                    const dayResponse = await getEnergyDays({
                        yearId: currentYearForDay,
                        monthId: currentMonthForDay,
                        startDay: currentDayForDay,
                        endDay: currentDayForDay,
                    });
                    
                    setApiData(unwrap(dayResponse));
                    break;

                case "mes":
                    const nowDate = new Date();
                    const currentYearForMonth = nowDate.getFullYear();
                    const currentMonthForMonth = nowDate.getMonth() + 1;
                    const currentDayForMonth = nowDate.getDate();
                    
                    let endDay = new Date(selectedYear, selectedMonth, 0).getDate();
                    if (selectedYear === currentYearForMonth && selectedMonth === currentMonthForMonth) {
                        endDay = currentDayForMonth;
                    }
                    
                    const monthResponse = await getEnergyDays({
                        yearId: selectedYear,
                        monthId: selectedMonth,
                        startDay: 1,
                        endDay: endDay,
                    });

                    setApiData(unwrap(monthResponse));
                    break;

                case "ano":
                    const yearResponse = await getEnergyMonths({
                        yearId: selectedYear,
                        startMonth: 1,
                        endMonth: 12,
                    });
                    
                    setApiData(unwrap(yearResponse));
                    break;
            }
        } catch (err: any) {
            console.error('Error fetching energy data:', err);
            setError(err.message || 'Erro ao carregar dados');
            setApiData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [periodFilter, selectedYear, selectedMonth]);


    const baseData = useMemo(() => {
        if (loading || apiData.length === 0) {
            switch (periodFilter) {
                case "dia":
                    const nowDate = new Date();
                    const dayLabel = nowDate.getDate().toString().padStart(2, "0");
                    const monthLabel = (nowDate.getMonth() + 1).toString().padStart(2, "0");
                    return [{ 
                        value: 0, 
                        label: `${dayLabel}/${monthLabel}`,
                        day: nowDate.getDate(),
                        month: nowDate.getMonth() + 1,
                        year: nowDate.getFullYear(),
                    }];
                case "mes": {
                    const nowDate = new Date();
                    const currentYearForMonth = nowDate.getFullYear();
                    const currentMonthForMonth = nowDate.getMonth() + 1;
                    const currentDayForMonth = nowDate.getDate();
                    
                    let daysToShow = new Date(selectedYear, selectedMonth, 0).getDate();
                    if (selectedYear === currentYearForMonth && selectedMonth === currentMonthForMonth) {
                        daysToShow = currentDayForMonth;
                    }
                    
                    return Array.from({ length: daysToShow }, (_, i) => {
                        const day = i + 1;
                        const date = new Date(selectedYear, selectedMonth - 1, day);
                        const dayLabel = date.getDate().toString().padStart(2, "0");
                        const monthLabel = (date.getMonth() + 1).toString().padStart(2, "0");
                        return {
                            value: 0,
                            label: `${dayLabel}/${monthLabel}`,
                        };
                    });
                }
                case "ano":
                    return meses.map((mes) => ({ value: 0, label: mes }));
                default:
                    return [];
            }
        }

        switch (periodFilter) {

            case "dia":
                const dayData = (Array.isArray(apiData) ? apiData : []) as EnergyDayData[];
                const today = new Date();
                const currentDay = today.getDate();
                const currentMonth = today.getMonth() + 1;
                const currentYear = today.getFullYear();
                
                const todayData = dayData.find((item) => 
                    item.day === currentDay && 
                    item.month === currentMonth && 
                    item.year === currentYear
                );
                
                let consumptionValue = todayData 
                    ? ((todayData as any).expenseKwh || todayData.consumeKwh || todayData.totalConsumption || todayData.averageConsumption || 0)
                    : 0;
                
                if (typeof consumptionValue === 'string') {
                    consumptionValue = parseFloat(consumptionValue) || 0;
                }
                consumptionValue = typeof consumptionValue === 'number' && !isNaN(consumptionValue) ? consumptionValue : 0;
                
                
                const dayLabel = currentDay.toString().padStart(2, "0");
                const monthLabel = currentMonth.toString().padStart(2, "0");
                
                return [{
                    value: consumptionValue,
                    label: `${dayLabel}/${monthLabel}`,
                    day: currentDay,
                    month: currentMonth,
                    year: currentYear,
                }];

            case "mes": {
                const monthDaysData = (Array.isArray(apiData) ? apiData : []) as EnergyDayData[];
                const nowDate = new Date();
                const currentYearForMonth = nowDate.getFullYear();
                const currentMonthForMonth = nowDate.getMonth() + 1;
                const currentDayForMonth = nowDate.getDate();
                
                let daysToShow = new Date(selectedYear, selectedMonth, 0).getDate();
                if (selectedYear === currentYearForMonth && selectedMonth === currentMonthForMonth) {
                    daysToShow = currentDayForMonth;
                }
                
                const monthDayMap = new Map<number, number>();
                
                monthDaysData.forEach((item) => {
                    const consumptionValue = item.consumeKwh || (item as any).expenseKwh || item.averageConsumption || 0;
                    monthDayMap.set(item.day, consumptionValue);
                });
                
                const result = Array.from({ length: daysToShow }, (_, i) => {
                    const day = i + 1;
                    const value = monthDayMap.get(day) || 0;
                    const date = new Date(selectedYear, selectedMonth - 1, day);
                    const dayLabel = date.getDate().toString().padStart(2, "0");
                    const monthLabel = (date.getMonth() + 1).toString().padStart(2, "0");
                    
                    const apiDayItem = monthDaysData.find((item) => 
                        item.day === day && 
                        item.month === selectedMonth && 
                        item.year === selectedYear
                    );
                    
                    return {
                        value: value,
                        label: `${dayLabel}/${monthLabel}`,
                        day: day,                        month: selectedMonth,
                        year: selectedYear,
                    };
                });
                
                return result;
            }

            case "ano":
                const monthsData = (Array.isArray(apiData) ? apiData : []) as EnergyMonthData[];
                const monthMap = new Map<number, number>();
                
                monthsData.forEach((item) => {
                    const consumptionValue = item.consumeKwh || (item as any).expenseKwh || item.averageConsumption || 0;
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
            const isSelected = selectedIndex === index;
            
            return {
                ...item,
                frontColor: isSelected ? colors.primaryLight || colors.primary : colors.primary,
                topLabelComponent: undefined, 
                topLabel: undefined, 
                topLabelTextStyle: undefined,
            };
        });
    }, [baseData, selectedIndex, colors, periodFilter]);

    useEffect(() => {
        setSelectedPoint(null);
        setSelectedIndex(null);
    }, [periodFilter]);

    const handleBarPress = (index: number) => {
        
        if (index < 0 || index >= baseData.length) {
            console.warn('Índice inválido:', index);
            return;
        }
        
        if (selectedIndex === index) {
            setSelectedIndex(null);
            setSelectedPoint(null);
        } else {
            const barItem = baseData[index];
            const apiItem = apiData[index] as any;
            
            if (barItem) {
                let consumptionValue = barItem.value || 0;
                
                if (apiItem) {
                    consumptionValue = (apiItem as any).expenseKwh || 
                                     apiItem.consumeKwh || 
                                     apiItem.totalConsumption || 
                                     apiItem.averageConsumption || 
                                     barItem.value || 
                                     0;
                }
                
                setSelectedIndex(index);
                setSelectedPoint({ 
                    ...barItem, 
                    ...(apiItem || {}),
                    index,
                    value: consumptionValue,
                });
            } else {
                console.warn('Item da barra não encontrado no índice:', index);
            }
        }
    };

    const chartColor = colors.primary;

    const gridColor = colors.border;
    const axisColor = colors.border;

    const averageConsumption = monthlyConsumption > 0
        ? monthlyConsumption.toFixed(1)
        : liveData.length > 0
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
    
    const currentConsumption = liveData.length > 0
        ? (liveData[liveData.length - 1]?.value || parseFloat(averageConsumption)).toFixed(1)
        : "0.0";
    
    const efficiency = liveData.length > 0
        ? Math.max(0, Math.min(100, Math.floor((28 / parseFloat(averageConsumption)) * 100)))
        : 0;
    
    const costImpact = (parseFloat(averageConsumption) * 0.40).toFixed(2);
    
    const trendAnalysis = "-2.2%";

    const getSpacing = () => {
        if (periodFilter === "dia") return 20; // Espaçamento para dia
        if (periodFilter === "mes") return 2; // Espaçamento mínimo para mês
        return 20; // ano - aumentado para dar mais espaço entre anos
    };

    const spacingValue = getSpacing();

    const getBarWidth = () => {
        if (periodFilter === "dia") {
            const availableWidth = screenWidth - 72; // Largura disponível menos padding
            const calculatedWidth = Math.floor((availableWidth - 12 - 24 - 32) / 1);
            return Math.max(60, Math.min(calculatedWidth, 120)); // Mínimo 60, máximo 120 para uma barra grande e visível
        }
        if (periodFilter === "mes") {
            return 5;
        }
        return 30;
    };

    const barWidthValue = getBarWidth();

    const containerChartWidth = Math.min(screenWidth - 72, 460);
    let computedChartWidth;
    if (periodFilter === "mes") {
        const daysInMonth = liveData.length;
        const minWidthPerDay = barWidthValue + spacingValue;
        computedChartWidth = (daysInMonth * minWidthPerDay) + 12 + 24 + 32;
        computedChartWidth = Math.max(computedChartWidth, screenWidth);
    } else if (periodFilter === "dia") {
        const minWidthForBar = barWidthValue + spacingValue + 8 + 16 + 32;
        computedChartWidth = Math.max(containerChartWidth, minWidthForBar);
    } else {
        computedChartWidth = liveData.length * (barWidthValue + spacingValue) + 12 + 24 + 32;
    }
    const chartWidth = periodFilter === "mes" 
        ? computedChartWidth // Para mês, usar a largura calculada completa
        : Math.max(containerChartWidth, computedChartWidth);

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
            <View style={styles.headerContainer}>
                <View style={styles.headerTop}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        Consumo Tempo Real
                    </Text>
                </View>
                <View style={styles.filterRow}>
                    <FilterBadge
                        label="Dia"
                        isActive={periodFilter === "dia"}
                        onPress={() => setPeriodFilter("dia")}
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
            
            {periodFilter === "ano" && (
                <View style={styles.yearSelectorContainer}>
                    <Text style={[styles.yearSelectorLabel, { color: colors.textSecondary }]}>
                        Ano:
                    </Text>
                    <View style={styles.yearSelectorRow}>
                        <TouchableOpacity
                            onPress={() => {
                                setSelectedYear(selectedYear - 1);
                            }}
                            style={[styles.yearSelectorButton, { borderColor: colors.border }]}
                        >
                            <Ionicons name="chevron-back" size={20} color={colors.text} />
                        </TouchableOpacity>
                        
                        <View style={[styles.yearSelectorValue, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[styles.yearSelectorText, { color: colors.text }]}>
                                {selectedYear.toString()}
                            </Text>
                        </View>
                        
                        <TouchableOpacity
                            onPress={() => {
                                const currentYear = new Date().getFullYear();
                                if (selectedYear < currentYear) {
                                    setSelectedYear(selectedYear + 1);
                                }
                            }}
                            style={[
                                styles.yearSelectorButton, 
                                { borderColor: colors.border },
                                selectedYear >= new Date().getFullYear() && { opacity: 0.5 }
                            ]}
                            disabled={selectedYear >= new Date().getFullYear()}
                        >
                            <Ionicons name="chevron-forward" size={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            
            {periodFilter === "mes" && (
                <View style={styles.yearSelectorContainer}>
                    <Text style={[styles.yearSelectorLabel, { color: colors.textSecondary }]}>
                        Ano/Mês:
                    </Text>
                    <View style={styles.yearSelectorRow}>
                        <TouchableOpacity
                            onPress={() => {
                                if (selectedMonth === 1) {
                                    setSelectedYear(selectedYear - 1);
                                    setSelectedMonth(12);
                                } else {
                                    setSelectedMonth(selectedMonth - 1);
                                }
                            }}
                            style={[styles.yearSelectorButton, { borderColor: colors.border }]}
                        >
                            <Ionicons name="chevron-back" size={20} color={colors.text} />
                        </TouchableOpacity>
                        
                        <View style={[styles.yearSelectorValue, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[styles.yearSelectorText, { color: colors.text }]}>
                                {`${meses[selectedMonth - 1]}/${selectedYear}`}
                            </Text>
                        </View>
                        
                        <TouchableOpacity
                            onPress={() => {
                                const currentYear = new Date().getFullYear();
                                const currentMonth = new Date().getMonth() + 1;
                                
                                if (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth)) {
                                    if (selectedMonth === 12) {
                                        setSelectedYear(selectedYear + 1);
                                        setSelectedMonth(1);
                                    } else {
                                        setSelectedMonth(selectedMonth + 1);
                                    }
                                }
                            }}
                            style={[
                                styles.yearSelectorButton, 
                                { borderColor: colors.border },
                                selectedYear >= new Date().getFullYear() && selectedMonth >= new Date().getMonth() + 1 && { opacity: 0.5 }
                            ]}
                            disabled={selectedYear >= new Date().getFullYear() && selectedMonth >= new Date().getMonth() + 1}
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

            {selectedPoint && selectedIndex !== null && (
                <View
                    style={[
                        styles.selectedInfoCard,
                    ]}
                >
                    <View style={styles.selectedInfoContent}>
                        <View style={styles.selectedInfoColumn}>
                            <View style={styles.selectedInfoRow}>
                                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                                <Text style={[styles.selectedInfoLabel, { color: colors.textSecondary }]}>
                                    {periodFilter === "ano" ? "Mês:" : "Dia:"}
                                </Text>
                            <Text style={[styles.selectedInfoValue, { color: colors.text }]}>
                                {(() => {
                                    const item = baseData[selectedIndex];
                                    
                                    if (periodFilter === "dia") {
                                        if (item && (item as any).day) {
                                            return `Dia ${(item as any).day}`;
                                        }
                                        if (item && item.label) {
                                            const dayFromLabel = item.label.split('/')[0];
                                            return `Dia ${parseInt(dayFromLabel)}`;
                                        }
                                        const apiItem = apiData[selectedIndex] as any;
                                        if (apiItem && apiItem.day) {
                                            return `Dia ${apiItem.day}`;
                                        }
                                        return "Dia atual";
                                    } else if (periodFilter === "mes") {
                                        if (item && (item as any).day) {
                                            return `Dia ${(item as any).day}`;
                                        }
                                        if (item && item.label) {
                                            const dayFromLabel = item.label.split('/')[0];
                                            return `Dia ${parseInt(dayFromLabel)}`;
                                        }
                                        const apiItem = apiData.find((api: any) => 
                                            api.day === selectedIndex + 1 && 
                                            api.month === selectedMonth && 
                                            api.year === selectedYear
                                        ) as any;
                                        if (apiItem && apiItem.day) {
                                            return `Dia ${apiItem.day}`;
                                        }
                                        return `Dia ${selectedIndex + 1}`;
                                    } else if (periodFilter === "ano") {
                                        if (item && item.label) {
                                            return item.label;
                                        }
                                        const apiItem = apiData[selectedIndex] as any;
                                        if (apiItem && apiItem.month) {
                                            const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
                                            return monthNames[apiItem.month - 1] || `Mês ${apiItem.month}`;
                                        }
                                        return meses[selectedIndex] || `Mês ${selectedIndex + 1}`;
                                    }
                                    
                                    return item?.label || `Item ${selectedIndex + 1}`;
                                })()}
                            </Text>
                            </View>
                            <View style={styles.selectedInfoRow}>
                                <Ionicons name="flash-outline" size={18} color={colors.primary} />
                                <Text style={[styles.selectedInfoLabel, { color: colors.textSecondary }]}>
                                    Consumo:
                                </Text>
                                <Text style={[styles.selectedInfoValue, { color: colors.primary, fontWeight: "700" }]}>
                                    {(() => {
                                        const value = selectedPoint.value ?? 
                                                     (selectedPoint as any).expenseKwh ?? 
                                                     (selectedPoint as any).consumeKwh ?? 
                                                     0;
                                        return typeof value === 'number' ? value.toFixed(3) : "0.000";
                                    })()} kWh
                                </Text>
                            </View>
                            <View style={styles.selectedInfoRow}>
                                <Ionicons name="cash-outline" size={18} color={colors.primary} />
                                <Text style={[styles.selectedInfoLabel, { color: colors.textSecondary }]}>
                                    Custo:
                                </Text>
                                <Text style={[styles.selectedInfoValue, { color: colors.success || colors.primary, fontWeight: "700" }]}>
                                    {(() => {
                                        const account = (selectedPoint as any).account;
                                        if (account !== undefined && account !== null && account !== "") {
                                            const accountValue = typeof account === 'number' 
                                                ? account 
                                                : parseFloat(account.toString().replace(',', '.'));
                                            
                                            if (!isNaN(accountValue)) {
                                                return `R$ ${accountValue.toFixed(2).replace('.', ',')}`;
                                            }
                                            return account.toString();
                                        }
                                        return "R$ 0,00";
                                    })()}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            setSelectedIndex(null);
                            setSelectedPoint(null);
                        }}
                        style={styles.closeInfoButton}
                    >
                        <Ionicons name="close" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
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
                    <EnergyBarChart
                        data={liveData}
                        selectedIndex={selectedIndex}
                        periodFilter={periodFilter}
                        colors={colors}
                        chartColor={chartColor}
                        gridColor={gridColor}
                        axisColor={axisColor}
                        barWidth={barWidthValue}
                        spacing={spacingValue}
                        chartWidth={chartWidth}
                        onBarPress={handleBarPress}
                    />
                )}
            </View>

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

            {showMoreInfo && (
                <View style={[styles.expandedInfoContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.currentConsumptionContainer}>
                        <Text style={[styles.currentConsumptionValue, { color: colors.text }]}>
                            {currentConsumption}
                        </Text>
                        <Text style={[styles.currentConsumptionLabel, { color: colors.textSecondary }]}>
                            kWh atual
                        </Text>
                    </View>

                    <View style={styles.trendContainer}>

                    </View>

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

            {showMoreInfo && (
                <View style={styles.moreInfoContainer}>
                    <GlobalCard
                        title="Análise de tendências"
                        value={trendAnalysis}
                        subtitle="vs Mês Passado"
                        icon="trending-down-outline"
                        color={colors.success}
                        variant="large"
                    />

                    <View style={styles.infoCardRow}>
                        <GlobalCard
                            title="Uso médio"
                            value={`${averageConsumption} kWh`}
                            icon="stats-chart"
                            color={colors.primary}
                        />
                        <GlobalCard
                            title="Uso máximo"
                            value={`${maxConsumption} kWh`}
                            icon="flash"
                            color={colors.warning}
                        />
                    </View>

                    <View style={styles.infoCardRow}>
                        <GlobalCard
                            title="Eficiência"
                            value={`${efficiency}%`}
                            icon="leaf-outline"
                            color={colors.success}
                        />
                        <GlobalCard
                            title="Impacto nos custos"
                            value={`R$ ${costImpact}`}
                            color={colors.text}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}


