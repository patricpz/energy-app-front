import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const dataDay = [
    { value: 12, label: '08h', price: 1.2 },
    { value: 18, label: '10h', price: 1.5 },
    { value: 10, label: '12h', price: 1.0 },
    { value: 22, label: '14h', price: 2.2 },
    { value: 30, label: '16h', price: 3.0 },
    { value: 24, label: '18h', price: 2.4 },
    { value: 28, label: '20h', price: 2.8 },
];

const dataWeek = [
    { value: 120, label: 'Seg', price: 12 },
    { value: 180, label: 'Ter', price: 18 },
    { value: 100, label: 'Qua', price: 10 },
    { value: 220, label: 'Qui', price: 22 },
    { value: 300, label: 'Sex', price: 30 },
    { value: 240, label: 'Sáb', price: 24 },
    { value: 280, label: 'Dom', price: 28 },
];

const dataMonth = [
    { value: 1200, label: 'Semana 1', price: 120 },
    { value: 1800, label: 'Semana 2', price: 180 },
    { value: 1000, label: 'Semana 3', price: 100 },
    { value: 2200, label: 'Semana 4', price: 220 },
];

const dataYear = [
    { value: 12000, label: 'Jan', price: 1200 },
    { value: 18000, label: 'Fev', price: 1800 },
    { value: 10000, label: 'Mar', price: 1000 },
    { value: 22000, label: 'Abr', price: 2200 },
    { value: 30000, label: 'Mai', price: 3000 },
    { value: 24000, label: 'Jun', price: 2400 },
    { value: 28000, label: 'Jul', price: 2800 },
    { value: 26000, label: 'Ago', price: 2600 },
    { value: 32000, label: 'Set', price: 3200 },
    { value: 28000, label: 'Out', price: 2800 },
    { value: 36000, label: 'Nov', price: 3600 },
    { value: 40000, label: 'Dez', price: 4000 },
];

export default function App() {
    const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day');
    const screenWidth = Dimensions.get('window').width;
    const selectedData = useMemo(() => {
        if (period === 'week') {
            return dataWeek;
        }

        if (period === 'month') {
            return dataMonth;
        }

        if (period === 'year') {
            return dataYear;
        }

        return dataDay;
    }, [period]);
    const chartInnerWidth = screenWidth - 64;
    const pointsCount = selectedData.length;
    const barWidth = Math.max(
        20,
        Math.min(34, (chartInnerWidth - 40) / Math.max(pointsCount, 1) - 12)
    );
    const barSpacing = Math.max(
        14,
        Math.min(26, (chartInnerWidth - pointsCount * barWidth - 24) / Math.max(pointsCount - 1, 1))
    );
    const chartStartSpacing = 12;
    const chartEndSpacing = 40;
    const contentWidth = Math.max(
        chartInnerWidth,
        chartStartSpacing + pointsCount * barWidth + (pointsCount - 1) * barSpacing + chartEndSpacing
    );

    const maxChartValue = Math.max(...selectedData.map((item) => item.value));

    // ----- CORREÇÃO 1: AUMENTAR BASTANTE O ESPAÇO SUPERIOR -----
    // Usando 1.5 (50% a mais) para garantir que o tooltip da barra mais alta caiba.
    const yAxisMaxValue = Math.ceil(maxChartValue * 1.5);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <Text style={styles.titleText}>Consumo Hoje</Text>
                <Text style={styles.subtitleText}>kWh por hora</Text>

                <View style={styles.periodRow}>
                    {[
                        { key: 'day', label: 'Dia' },
                        { key: 'week', label: 'Semana' },
                        { key: 'month', label: 'Mes' },
                        { key: 'year', label: 'Ano' },
                    ].map((item) => {
                        const active = period === item.key;
                        return (
                            <TouchableOpacity
                                key={item.key}
                                onPress={() => setPeriod(item.key as 'day' | 'week' | 'month' | 'year')}
                                style={[styles.periodButton, active && styles.periodButtonActive]}
                            >
                                <Text style={[styles.periodText, active && styles.periodTextActive]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chartScroll}
                >
                    <BarChart
                        data={selectedData.map((item) => ({ ...item, frontColor: '#3E7BFA' }))}
                        isAnimated
                        animationDuration={1200}
                        focusBarOnPress
                        autoCenterTooltip
                        renderTooltip={(item: any, index: number) => {
                            let styleCorrection = {};
                            if (index === 0) {
                                styleCorrection = { marginLeft: 40 };
                            }
                            else if (index === selectedData.length - 1) {
                                styleCorrection = { marginRight: 40 };
                            }

                            return (
                                <View style={[styles.tooltipWrapper, styleCorrection]}>
                                    <View style={styles.tooltip}>
                                        <Text style={styles.tooltipLabel}>{item.label}</Text>
                                        <Text style={styles.tooltipValue}>{item.value} kWh</Text>
                                        <Text style={styles.tooltipPrice}>R$ {item.price}</Text>
                                    </View>
                                </View>
                            )
                        }}                        
                        height={220}
                        barWidth={barWidth}
                        spacing={barSpacing}
                        initialSpacing={chartStartSpacing}
                        endSpacing={chartEndSpacing}
                        width={contentWidth}
                        maxValue={yAxisMaxValue}
                        yAxisTextStyle={styles.axisText}
                        xAxisLabelTextStyle={styles.axisText}
                        rulesColor="#E8ECF2"
                        overflowTop={50}
                    />
                </ScrollView>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 1,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'visible',
    },
    titleText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    subtitleText: {
        marginTop: 4,
        marginBottom: 16,
        fontSize: 14,
        color: '#6B7280',
    },
    periodRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    periodButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
    },
    periodButtonActive: {
        backgroundColor: '#3E7BFA',
    },
    periodText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
    },
    periodTextActive: {
        color: '#FFFFFF',
    },
    axisText: {
        color: '#6B7280',
        fontSize: 11,
    },
    chartScroll: {
        marginTop: 12,
        paddingBottom: 4,
        overflow: 'visible',
    },
    tooltipWrapper: {
        width: 108,
        height: 62,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        elevation: 8,
    },
    tooltip: {
        backgroundColor: '#111827',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    tooltipLabel: {
        color: '#E5E7EB',
        fontSize: 11,
    },
    tooltipValue: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        marginTop: 2,
    },
    tooltipPrice: {
        color: '#BFDBFE',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 1,
    },
});