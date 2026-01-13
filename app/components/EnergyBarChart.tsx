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
                data={data.map((item, index) => ({
                    ...item,
                    // Usar frontColor do item (já vem do GraphicMeter com a cor correta)
                    frontColor: item.frontColor || chartColor,
                    topLabelComponent: selectedIndex === index ? () => (
                        <View
                            style={{
                                marginBottom: 4,
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 6,
                                backgroundColor: colors.primaryLight ?? colors.primary,
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.text,
                                    fontSize: 12,
                                    fontWeight: "600",
                                }}
                            >
                                {item.value.toFixed(3)} kWh
                            </Text>
                        </View>
                    ) : undefined,
                }))} barWidth={barWidth}
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
                onPress={onBarPress}
                showGradient={false}
                isAnimated={false}
                showValuesAsTopLabel={false}
            />
        </ScrollView>
    );
}
