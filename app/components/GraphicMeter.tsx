import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "../context/ThemeContext";
import { EnergyDayData, EnergyHourData, EnergyMonthData, EnergyYearData, getEnergyDays, getEnergyMonths } from "../services/energyReport";
import EnergyBarChart from "./EnergyBarChart";
import GlobalCard from "./GlobalCard";

type PeriodFilter = "dia" | "semana" | "mes" | "ano";

export default function GraphicMeter() {
    const { theme } = useTheme();
    const colors = theme.colors;
    const screenWidth = Dimensions.get("window").width;

    const [selectedPoint, setSelectedPoint] = useState<any>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [currentTime, setCurrentTime] = useState("");
    const [currentDate, setCurrentDate] = useState("");
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("semana");
    const [showMoreInfo, setShowMoreInfo] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiData, setApiData] = useState<EnergyHourData[] | EnergyDayData[] | EnergyMonthData[] | EnergyYearData[]>([]);
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

    const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    // Todas as horas do dia (0-23)
    const horasDia = Array.from({ length: 24 }, (_, i) => i);


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
                // case "dia":
                //     // Buscar todas as horas do dia atual (0-23)
                //     const hoursData = await getEnergyHours({
                //         yearId: currentYear,
                //         monthId: currentMonth,
                //         dayId: currentDay,
                //     });
                //     setApiData(hoursData);
                //     break;

                case "semana":
                    // Buscar domingo a sábado da semana atual
                    const today = new Date(now);
                    const dayOfWeek = today.getDay(); // 0 = domingo, 1 = segunda, etc.
                    // Calcular quantos dias voltar para chegar no domingo
                    const daysToSunday = dayOfWeek; // Se domingo (0), volta 0 dias; se segunda (1), volta 1 dia, etc.
                    const sunday = new Date(today);
                    sunday.setDate(today.getDate() - daysToSunday);
                    const saturday = new Date(sunday);
                    saturday.setDate(sunday.getDate() + 6); // Sábado (domingo + 6 dias)
                    
                    // Buscar dias de domingo a sábado
                    const daysData = await getEnergyDays({
                        yearId: sunday.getFullYear(),
                        monthId: sunday.getMonth() + 1,
                        startDate: sunday.toISOString().split('T')[0],
                        endDate: saturday.toISOString().split('T')[0],
                    });
                    setApiData(Array.isArray(daysData) ? daysData : []);
                    break;

                case "mes":
                    // Buscar apenas os dias do mês atual até o dia de hoje
                    const nowDate = new Date();
                    const currentYearForMonth = nowDate.getFullYear();
                    const currentMonthForMonth = nowDate.getMonth() + 1;
                    const currentDayForMonth = nowDate.getDate();
                    
                    // Se o mês selecionado é o mês atual, mostrar apenas até hoje
                    // Caso contrário, mostrar todos os dias do mês selecionado
                    let endDay = new Date(selectedYear, selectedMonth, 0).getDate();
                    if (selectedYear === currentYearForMonth && selectedMonth === currentMonthForMonth) {
                        endDay = currentDayForMonth;
                    }
                    
                    const monthDaysData = await getEnergyDays({
                        yearId: selectedYear,
                        monthId: selectedMonth,
                        startDay: 1,
                        endDay: endDay,
                    });
                    setApiData(Array.isArray(monthDaysData) ? monthDaysData : []);
                    break;

                case "ano":
                    // Buscar todos os meses do ano selecionado (janeiro a dezembro)
                    const monthsData = await getEnergyMonths({
                        yearId: selectedYear,
                        startMonth: 1,
                        endMonth: 12,
                    });
                    setApiData(Array.isArray(monthsData) ? monthsData : []);
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
    // useEffect(() => {
    //     if (periodFilter === "dia") {
    //         const interval = setInterval(() => {
    //             fetchData();
    //         }, 30000); // Atualiza a cada 30 segundos

    //         return () => clearInterval(interval);
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [periodFilter]);

    // Converter dados da API para o formato do gráfico
    const baseData = useMemo(() => {
        if (loading || apiData.length === 0) {
            // Retornar dados vazios enquanto carrega ou se não houver dados
            switch (periodFilter) {
                // case "dia":
                //     return horasDia.map((hora) => ({
                //         value: 0,
                //         label: `${hora.toString().padStart(2, "0")}:00`,
                //         hour: hora,
                //     }));
                case "semana":
                    return diasSemana.map((dia) => ({ value: 0, label: dia }));
                case "mes": {
                    // Retornar apenas os dias até hoje se for o mês atual
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
                    // Retornar todos os meses de janeiro a dezembro
                    return meses.map((mes) => ({ value: 0, label: mes }));
                default:
                    return [];
            }
        }

        switch (periodFilter) {
            // case "dia":
            //     // Mapear dados de horas (todas as horas do dia: 0-23)
            //     const hoursData = apiData as EnergyHourData[];
            //     const hourMap = new Map<number, number>();
            //     hoursData.forEach((item) => {
            //         const consumptionValue = item.consumeKwh || (item as any).expenseKwh || (item as any).totalConsumption || (item as any).averageConsumption || 0;
            //         hourMap.set(item.hour, consumptionValue);
            //     });
            //     
            //     return horasDia.map((hora) => {
            //         const consumption = hourMap.get(hora) || 0;
            //         return {
            //             value: consumption,
            //             label: `${hora.toString().padStart(2, "0")}:00`,
            //             hour: hora,
            //         };
            //     });

            case "semana":
                // Mapear dados de dias (domingo a sábado)
                const daysData = (Array.isArray(apiData) ? apiData : []) as EnergyDayData[];
                const sortedDays = daysData.length > 0
                    ? [...daysData].sort((a, b) => {
                        const dateA = new Date(a.year, a.month - 1, a.day);
                        const dateB = new Date(b.year, b.month - 1, b.day);
                        return dateA.getTime() - dateB.getTime();
                    })
                    : [];
                
                // Criar um mapa de data para consumo
                const weekDayMap = new Map<string, number>();
                sortedDays.forEach((dayData) => {
                    const dateKey = `${dayData.year}-${dayData.month}-${dayData.day}`;
                    const consumptionValue = (dayData as any).expenseKwh || dayData.totalConsumption || dayData.averageConsumption || 0;
                    weekDayMap.set(dateKey, consumptionValue);
                });
                
                // Calcular domingo da semana atual
                const today = new Date();
                const currentDayOfWeek = today.getDay();
                const daysToSunday = currentDayOfWeek;
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - daysToSunday);
                
                // Garantir que temos 7 dias (domingo a sábado)
                const weekData = Array.from({ length: 7 }, (_, index) => {
                    const currentDay = new Date(weekStart);
                    currentDay.setDate(weekStart.getDate() + index);
                    const dateKey = `${currentDay.getFullYear()}-${currentDay.getMonth() + 1}-${currentDay.getDate()}`;
                    const consumptionValue = weekDayMap.get(dateKey) || 0;
                    
                    return {
                        value: consumptionValue,
                        label: diasSemana[index],
                    };
                });
                
                return weekData;

            case "mes": {
                // Mapear dados de dias do mês (apenas até o dia atual)
                const monthDaysData = (Array.isArray(apiData) ? apiData : []) as EnergyDayData[];
                const nowDate = new Date();
                const currentYearForMonth = nowDate.getFullYear();
                const currentMonthForMonth = nowDate.getMonth() + 1;
                const currentDayForMonth = nowDate.getDate();
                
                // Calcular quantos dias mostrar
                let daysToShow = new Date(selectedYear, selectedMonth, 0).getDate();
                if (selectedYear === currentYearForMonth && selectedMonth === currentMonthForMonth) {
                    daysToShow = currentDayForMonth;
                }
                
                const monthDayMap = new Map<number, number>();
                
                // Mapear todos os dados recebidos da API
                monthDaysData.forEach((item) => {
                    const consumptionValue = item.consumeKwh || (item as any).expenseKwh || item.averageConsumption || 0;
                    monthDayMap.set(item.day, consumptionValue);
                });
                
                // Gerar array com os dias do mês até hoje (com tempo no eixo X)
                const result = Array.from({ length: daysToShow }, (_, i) => {
                    const day = i + 1;
                    const value = monthDayMap.get(day) || 0;
                    // Mostrar o dia com formato "DD/MM" no eixo X
                    const date = new Date(selectedYear, selectedMonth - 1, day);
                    const dayLabel = date.getDate().toString().padStart(2, "0");
                    const monthLabel = (date.getMonth() + 1).toString().padStart(2, "0");
                    return {
                        value: value,
                        label: `${dayLabel}/${monthLabel}`,
                    };
                });
                
                return result;
            }

            case "ano":
                // Mapear dados de meses do ano (janeiro a dezembro)
                const monthsData = (Array.isArray(apiData) ? apiData : []) as EnergyMonthData[];
                const monthMap = new Map<number, number>();
                
                monthsData.forEach((item) => {
                    const consumptionValue = item.consumeKwh || (item as any).expenseKwh || item.averageConsumption || 0;
                    monthMap.set(item.month, consumptionValue);
                });
                
                // Retornar todos os meses de janeiro a dezembro
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
            const hourLabel = (item as any).hour || item.label || `${index}:00`;
            
            return {
                ...item,
                frontColor: isSelected ? colors.primaryLight || colors.primary : colors.primary,
                topLabel: isSelected ? item.value.toFixed(3) : undefined,
                topLabelTextStyle: isSelected ? {
                    color: colors.text || "#000000",
                    fontSize: 12,
                    fontWeight: "600",
                } : undefined,
            };
        });
    }, [baseData, selectedIndex, colors, periodFilter]);

    useEffect(() => {
        setSelectedPoint(null);
        setSelectedIndex(null);
    }, [periodFilter]);

    // Função para lidar com o clique na barra
    const handleBarPress = (index: number) => {
        console.log('Bar pressed - index:', index);
        
        // Se clicar na mesma barra, deseleciona
        if (selectedIndex === index) {
            setSelectedIndex(null);
            setSelectedPoint(null);
        } else {
            // Seleciona a nova barra
            const barItem = baseData[index];
            if (barItem) {
                setSelectedIndex(index);
                setSelectedPoint({ 
                    ...barItem, 
                    index,
                    value: barItem.value || 0,
                });
                console.log('Bar selected:', { index, value: barItem.value });
            }
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
        // if (periodFilter === "dia") return 4; // Reduzido para caber 24 horas
        if (periodFilter === "semana") return 10;
        if (periodFilter === "mes") return 2; // Espaçamento mínimo para mês
        return 20; // ano - aumentado para dar mais espaço entre anos
    };

    const spacingValue = getSpacing();

    const getBarWidth = () => {
        // if (periodFilter === "dia") {
        //     // Para 24 horas, calcular largura dinâmica
        //     const availableWidth = screenWidth - 72;
        //     const totalSpacing = 23 * 4; // 23 espaços entre 24 barras
        //     const calculatedWidth = Math.floor((availableWidth - totalSpacing - 12 - 24 - 32) / 24);
        //     return Math.max(8, Math.min(calculatedWidth, 16)); // Mínimo 8, máximo 16
        // }
        if (periodFilter === "semana") {
            // Calcular largura dinâmica baseada na largura da tela e número de dias (7)
            const availableWidth = screenWidth - 72; // Largura disponível menos padding
            const totalSpacing = 6 * 10; // 6 espaços entre 7 barras
            const calculatedWidth = Math.floor((availableWidth - totalSpacing - 12 - 24 - 32) / 7);
            return Math.max(16, Math.min(calculatedWidth, 24)); // Mínimo 16, máximo 24
        }
        if (periodFilter === "mes") {
            // Para mês, usar largura fixa pequena já que teremos muitos dias
            // O gráfico será scrollável horizontalmente
            return 5;
        }
        return 30; // ano - aumentado para melhor visualização
    };

    const barWidthValue = getBarWidth();

    const containerChartWidth = Math.min(screenWidth - 72, 460);
    // Para o mês, garantir largura suficiente para TODOS os dias do mês
    let computedChartWidth;
    if (periodFilter === "mes") {
        // Calcular largura necessária para todos os dias do mês
        const daysInMonth = liveData.length;
        const minWidthPerDay = barWidthValue + spacingValue;
        // Calcular largura total: (largura da barra + spacing) * número de dias + espaçamentos iniciais/finais
        computedChartWidth = (daysInMonth * minWidthPerDay) + 12 + 24 + 32;
        // Garantir que seja pelo menos a largura da tela para scroll funcionar
        // Mas não limitar o máximo - deixar o gráfico expandir para mostrar todos os dias
        computedChartWidth = Math.max(computedChartWidth, screenWidth);
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
            {/* Header com título e informações */}
            <View style={styles.headerContainer}>
                <View style={styles.headerTop}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        Consumo Tempo Real
                    </Text>
                </View>
                {/* {periodFilter === "dia" && (
                    <View style={styles.lastUpdateRow}>
                        <Text style={[styles.lastUpdateLabel, { color: colors.textSecondary }]}>
                            Última atualização: {currentTime}
                        </Text>
                    </View>
                )} */}
                <View style={styles.filterRow}>
                    {/* <FilterBadge
                        label="Dia"
                        isActive={periodFilter === "dia"}
                        onPress={() => setPeriodFilter("dia")}
                    /> */}
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
            
            {/* Seletor de ano quando o filtro for "ano" */}
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
            
            {/* Seletor de ano/mês quando o filtro for "mes" */}
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
            {showMoreInfo && (
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
                    <GlobalCard
                        title="Análise de tendências"
                        value={trendAnalysis}
                        subtitle="vs Mês Passado"
                        icon="trending-down-outline"
                        color={colors.success}
                        variant="large"
                    />

                    {/* Segunda linha: Uso médio e Uso máximo */}
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

                    {/* Terceira linha: Eficiência e Impacto nos custos */}
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
