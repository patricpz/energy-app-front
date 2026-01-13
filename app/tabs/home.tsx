import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import EnergyMeter from "../components/EnergyMeter";
import AppCard from "../components/GlobalCard";
import GraphicMeter from "../components/GraphicMeter";
import Header from "../components/Header";
import PulseWebSocketLed from "../components/PulseWebSocketLed";
import { useTheme } from "../context/ThemeContext";
import SafeScreen from "../SafeScreen";
import { getEnergyMonths } from "../services/energyReport";

export default function Home() {
    const { theme } = useTheme();
    const [pulseActive, setPulseActive] = useState(false);
    const [energyCost, setEnergyCost] = useState<string>("R$ 0.00");
    const [monthlyConsumption, setMonthlyConsumption] = useState<string>("0.0");

    // Buscar account e expenseKwh do mês atual
    useEffect(() => {
        const fetchMonthData = async () => {
            try {
                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth() + 1;
                
                const monthsData = await getEnergyMonths({
                    year: currentYear,
                    startMonth: currentMonth,
                    endMonth: currentMonth,
                });
                
                console.log('📊 Relatório de Meses (energyMonths) - Array completo:', JSON.stringify(monthsData, null, 2));
                console.log('📊 Tipo de relatório: Relatório de consumo mensal do ano');
                
                if (monthsData && monthsData.length > 0) {
                    const monthData = monthsData[0];
                    
                    // Console detalhado do mês atual
                    console.log('═══════════════════════════════════════');
                    console.log('📅 MÊS ATUAL - Dados completos:');
                    console.log('═══════════════════════════════════════');
                    console.log(JSON.stringify(monthData, null, 2));
                    console.log('───────────────────────────────────────');
                    console.log('📋 Campos individuais do mês atual:');
                    Object.keys(monthData).forEach(key => {
                        console.log(`  • ${key}:`, (monthData as any)[key]);
                    });
                    console.log('═══════════════════════════════════════');
                    
                    // Buscar account (custo)
                    const account = (monthData as any).account;
                    if (account !== undefined && account !== null) {
                        // Formatar como moeda brasileira
                        const formattedValue = typeof account === 'number' 
                            ? account.toFixed(2).replace('.', ',')
                            : account.toString();
                        setEnergyCost(`R$ ${formattedValue}`);
                    }
                    
                    // Buscar expenseKwh (consumo total do mês)
                    const expenseKwh = (monthData as any).expenseKwh || monthData.consumeKwh || 0;
                    if (expenseKwh !== undefined && expenseKwh !== null) {
                        // Formatar com mais casas decimais para valores pequenos
                        const formattedConsumption = typeof expenseKwh === 'number' 
                            ? expenseKwh < 1 
                                ? expenseKwh.toFixed(5) // Para valores < 1, mostrar 5 casas decimais
                                : expenseKwh.toFixed(1) // Para valores >= 1, mostrar 1 casa decimal
                            : expenseKwh.toString();
                        setMonthlyConsumption(formattedConsumption);
                    }
                }
            } catch (err) {
                console.error('Erro ao buscar dados do mês:', err);
            }
        };
        
        fetchMonthData();
    }, []);

    return (
        <SafeScreen>
            <ScrollView>
                <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                    <Header />

                    <View style={styles.content}>
                        <View style={styles.pulseRow}>
                            <PulseWebSocketLed
                                onPulse={() => {
                                    setPulseActive(true);
                                    setTimeout(() => setPulseActive(false), 150);
                                }}
                            />
                        </View>

                        <View style={{ alignItems: "center", marginTop: 20 }}>
                            <EnergyMeter pulseActive={pulseActive} />
                        </View>
                        <View style={styles.cardRow}>
                            <AppCard
                                title="Custo de Energia"
                                value={energyCost}
                                subtitle="kWh"
                                icon="flash"
                                color="#153ffaff"
                            />
                            <AppCard
                                title="Consumo Total"
                                value={monthlyConsumption}
                                subtitle="kWh"
                                icon="flash"
                                color="#facc15"
                            />
                        </View>
                        <View style={styles.sectionGraphic}>
                            <GraphicMeter />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeScreen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
    },
    sectionGraphic: {
        marginTop: 20,
        padding: 0,
    },
    pulseRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingRight: 8,
    },
    cardRow: {
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    }
});
