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
            
            const unwrap = (response: any) => {
                if (response && response.data && Array.isArray(response.data)) return response.data;
                if (Array.isArray(response)) return response;
                return [];
            };

            // Buscar consumo do mês atual para exibir no "Consumo Médio"
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
                    
                    // Usa o unwrap para garantir que pegou a lista certa
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
                case "dia":
                    // Retornar APENAS uma barra do dia atual (mesmo sem dados)
                    const nowDate = new Date();
                    const dayLabel = nowDate.getDate().toString().padStart(2, "0");
                    const monthLabel = (nowDate.getMonth() + 1).toString().padStart(2, "0");
                    // Retornar apenas UMA barra com valor 0 enquanto carrega
                    return [{ 
                        value: 0, 
                        label: `${dayLabel}/${monthLabel}`,
                        day: nowDate.getDate(),
                        month: nowDate.getMonth() + 1,
                        year: nowDate.getFullYear(),
                    }];
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

            case "dia":
                // Mapear dados do dia atual - GARANTIR APENAS UMA BARRA
                const dayData = (Array.isArray(apiData) ? apiData : []) as EnergyDayData[];
                const today = new Date();
                const currentDay = today.getDate();
                const currentMonth = today.getMonth() + 1;
                const currentYear = today.getFullYear();
                
                // Filtrar APENAS o dia atual, ignorando qualquer outro dia que possa vir na resposta
                const todayData = dayData.find((item) => 
                    item.day === currentDay && 
                    item.month === currentMonth && 
                    item.year === currentYear
                );
                
                // Extrair o valor de consumo (priorizar expenseKwh)
                let consumptionValue = todayData 
                    ? ((todayData as any).expenseKwh || todayData.consumeKwh || todayData.totalConsumption || todayData.averageConsumption || 0)
                    : 0;
                
                // Garantir que o valor seja numérico
                if (typeof consumptionValue === 'string') {
                    consumptionValue = parseFloat(consumptionValue) || 0;
                }
                consumptionValue = typeof consumptionValue === 'number' && !isNaN(consumptionValue) ? consumptionValue : 0;
                
                // Debug: log do valor
                console.log('[GraphicMeter] Dia - consumptionValue:', consumptionValue, 'todayData:', todayData);
                
                // Formatar label como "DD/MM"
                const dayLabel = currentDay.toString().padStart(2, "0");
                const monthLabel = currentMonth.toString().padStart(2, "0");
                
                // RETORNAR APENAS UMA BARRA - do dia determinado
                return [{
                    value: consumptionValue,
                    label: `${dayLabel}/${monthLabel}`,
                    day: currentDay,
                    month: currentMonth,
                    year: currentYear,
                }];

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
                    
                    // Encontrar o item correspondente na API para manter referência
                    const apiDayItem = monthDaysData.find((item) => 
                        item.day === day && 
                        item.month === selectedMonth && 
                        item.year === selectedYear
                    );
                    
                    return {
                        value: value,
                        label: `${dayLabel}/${monthLabel}`,
                        day: day, // Incluir o dia para facilitar acesso
                        month: selectedMonth,
                        year: selectedYear,
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

    // Função para lidar com o clique na barra
    const handleBarPress = (index: number) => {
        console.log('Bar pressed - index:', index);
        
        // Verificar se o índice é válido
        if (index < 0 || index >= baseData.length) {
            console.warn('Índice inválido:', index);
            return;
        }
        
        // Se clicar na mesma barra, deseleciona
        if (selectedIndex === index) {
            setSelectedIndex(null);
            setSelectedPoint(null);
            console.log('Barra deselecionada');
        } else {
            // Seleciona a nova barra
            const barItem = baseData[index];
            const apiItem = apiData[index] as any;
            
            if (barItem) {
                // Extrair o valor de consumo (priorizar expenseKwh da API, depois value do item)
                let consumptionValue = barItem.value || 0;
                
                // Tentar obter o valor da API se disponível (mais preciso)
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
                console.log('Barra selecionada:', { 
                    index, 
                    value: consumptionValue,
                    label: barItem.label,
                    apiValue: apiItem ? ((apiItem as any).expenseKwh || apiItem.consumeKwh) : null
                });
            } else {
                console.warn('Item da barra não encontrado no índice:', index);
            }
        }
    };

    const chartColor = colors.primary;

    const gridColor = colors.border;
    const axisColor = colors.border;

    // Calcular métricas
    // Consumo Médio: usar o consumo do mês atual (expenseKwh) em vez da média dos dados do gráfico
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
        if (periodFilter === "dia") return 20; // Espaçamento para dia
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
        if (periodFilter === "dia") {
            // Calcular largura dinâmica baseada na largura da tela para 1 barra
            const availableWidth = screenWidth - 72; // Largura disponível menos padding
            const calculatedWidth = Math.floor((availableWidth - 12 - 24 - 32) / 1);
            // Aumentar a largura mínima e máxima para garantir que a barra seja bem visível
            return Math.max(60, Math.min(calculatedWidth, 120)); // Mínimo 60, máximo 120 para uma barra grande e visível
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
    } else if (periodFilter === "dia") {
        // Para dia, garantir largura mínima para uma barra grande e visível
        // Centralizar a barra no gráfico (8 de espaçamento inicial + 16 de final + barra + espaçamento)
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

            {/* Div informativa acima do gráfico quando uma barra é selecionada */}
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
                                    // Extrair o dia/mês do selectedPoint ou do baseData
                                    const item = baseData[selectedIndex];
                                    
                                    if (periodFilter === "dia") {
                                        // Para dia: mostrar apenas o dia (ex: "Dia 15")
                                        // Priorizar o campo day do item
                                        if (item && (item as any).day) {
                                            return `Dia ${(item as any).day}`;
                                        }
                                        // Fallback: extrair do label "DD/MM"
                                        if (item && item.label) {
                                            const dayFromLabel = item.label.split('/')[0];
                                            return `Dia ${parseInt(dayFromLabel)}`;
                                        }
                                        // Último fallback: usar apiItem
                                        const apiItem = apiData[selectedIndex] as any;
                                        if (apiItem && apiItem.day) {
                                            return `Dia ${apiItem.day}`;
                                        }
                                        return "Dia atual";
                                    } else if (periodFilter === "mes") {
                                        // Para mês: mostrar o dia (ex: "Dia 15")
                                        // Priorizar o campo day do item
                                        if (item && (item as any).day) {
                                            return `Dia ${(item as any).day}`;
                                        }
                                        // Fallback: extrair do label "DD/MM"
                                        if (item && item.label) {
                                            const dayFromLabel = item.label.split('/')[0];
                                            return `Dia ${parseInt(dayFromLabel)}`;
                                        }
                                        // Último fallback: buscar na API pelo índice
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
                                        // Para ano: mostrar o mês (ex: "Jan")
                                        // O label já contém o nome do mês
                                        if (item && item.label) {
                                            return item.label; // Já contém o nome do mês (ex: "Jan", "Fev")
                                        }
                                        // Fallback: usar o mês da API
                                        const apiItem = apiData[selectedIndex] as any;
                                        if (apiItem && apiItem.month) {
                                            const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
                                            return monthNames[apiItem.month - 1] || `Mês ${apiItem.month}`;
                                        }
                                        return meses[selectedIndex] || `Mês ${selectedIndex + 1}`;
                                    }
                                    
                                    // Fallback genérico
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
                                        // Garantir que o valor seja exibido corretamente
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
                                        // Extrair o account (custo) do selectedPoint
                                        const account = (selectedPoint as any).account;
                                        if (account !== undefined && account !== null && account !== "") {
                                            // Formatar como moeda brasileira
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
    selectedInfoCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        backgroundColor: "#FFF"
    },
    selectedInfoContent: {
        flex: 1,
    },
    selectedInfoColumn: {
        flex: 1,
        flexDirection: "column",
        gap: 8,
    },
    selectedInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    selectedInfoLabel: {
        fontSize: 13,
        fontWeight: "500",
    },
    selectedInfoValue: {
        fontSize: 14,
        fontWeight: "600",
    },
    closeInfoButton: {
        padding: 4,
        marginLeft: 8,
    },
});
