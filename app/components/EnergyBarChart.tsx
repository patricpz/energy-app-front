import React from "react";
import { ScrollView, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

type PeriodFilter = "dia" | "semana" | "mes" | "ano";

interface EnergyBarChartProps {
    data: Array<{
        value: number;
        label: string;
        frontColor?: string;
        topLabel?: string;
        topLabelTextStyle?: {
            color: string;
            fontSize: number;
            fontWeight: string;
        };
    }>;
    selectedIndex: number | null;
    periodFilter: PeriodFilter;
    colors: {
        primary: string;
        primaryLight?: string;
        text: string;
        textSecondary: string;
        border: string;
    };
    chartColor: string;
    gridColor: string;
    axisColor: string;
    barWidth: number;
    spacing: number;
    chartWidth: number;
    onBarPress: (index: number) => void;
}

export default function EnergyBarChart({
    data,
    selectedIndex,
    periodFilter,
    colors,
    chartColor,
    gridColor,
    axisColor,
    barWidth,
    spacing,
    chartWidth,
    onBarPress,
}: EnergyBarChartProps) {
    // Calcular maxValue
    const maxValue = (() => {
        if (data.length === 0) return 0.01;
        const maxVal = Math.max(...data.map(item => item.value), 0);
        return maxVal > 0 ? Math.max(maxVal * 1.1, 0.01) : 0.01;
    })();

    // Espaçamentos baseados no período
    const initialSpacing = periodFilter === "mes" ? 8 : (periodFilter === "dia" ? 8 : 12);
    const endSpacing = periodFilter === "mes" ? 16 : (periodFilter === "dia" ? 16 : 24);

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={periodFilter === "mes" || periodFilter === "dia"}
            bounces={false}
            contentContainerStyle={(periodFilter === "mes" || periodFilter === "dia") ? { paddingRight: 20 } : undefined}
        >
            <BarChart
                data={data.map((item, index) => {
                    const isSelected = selectedIndex === index;
                    // Garantir que o valor seja numérico e válido
                    const value = typeof item.value === 'number' && !isNaN(item.value) ? item.value : 0;
                    // Verificar se o valor é maior que 0 (não mostrar label se for 0)
                    const hasValue = value > 0.0001;
                    
                    // Criar objeto limpo sem propriedades que possam causar conflito
                    const cleanItem: any = {
                        value: value,
                        label: item.label,
                        frontColor: item.frontColor || chartColor,
                    };
                    
                    // Remover qualquer propriedade que possa estar causando o índice ou 0 ser exibido
                    // Não incluir topLabel, topLabelTextStyle ou outras propriedades que possam interferir
                    if (isSelected && hasValue) {
                        // Mostrar topLabelComponent apenas quando selecionado E valor > 0
                        cleanItem.topLabelComponent = () => (
                            <View
                                style={{
                                    marginBottom: 4,
                                    paddingHorizontal: 8,
                                    paddingVertical: 4,
                                    borderRadius: 8,
                                    backgroundColor: colors.primaryLight ?? colors.primary,
                                    shadowColor: "#000",
                                    shadowOffset: {
                                        width: 0,
                                        height: 2,
                                    },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    elevation: 5,
                                }}
                            >
                                <Text
                                    style={{
                                        color: colors.text,
                                        fontSize: 13,
                                        fontWeight: "700",
                                    }}
                                >
                                    {value.toFixed(3)} kWh
                                </Text>
                            </View>
                        );
                    } else {
                        // Garantir que não há topLabelComponent quando valor é 0 ou não está selecionado
                        cleanItem.topLabelComponent = undefined;
                    }
                    
                    return cleanItem;
                })} barWidth={barWidth}
                spacing={spacing}
                initialSpacing={initialSpacing}
                endSpacing={endSpacing}
                barBorderRadius={6}
                height={220}
                width={chartWidth}
                maxValue={maxValue}
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
                xAxisLabelTextStyle={{
                    color: colors.textSecondary,
                    fontSize: periodFilter === "mes" ? 9 : 11
                }}
                xAxisLabelsHeight={periodFilter === "mes" ? 30 : 20}
                onPress={(item: any, index: number) => {
                    // Garantir que o índice seja passado corretamente
                    console.log('BarChart onPress - item:', item, 'index:', index);
                    onBarPress(index);
                }}
                showGradient={false}
                isAnimated={false}
                showValuesAsTopLabel={false}
            />
        </ScrollView>
    );
}
