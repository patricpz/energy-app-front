import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import EnergyMeter from "../components/EnergyMeter";
import AppCard from "../components/GlobalCard";
import GraphicMeter from "../components/GraphicMeter";
import Header from "../components/Header";
import PulseWebSocketLed from "../components/PulseWebSocketLed";
import { useTheme } from "../context/ThemeContext";
import SafeScreen from "../SafeScreen";
import { getEnergyMonths } from "../services/energyReport";
import { homeStyles as styles } from "./styles/homeStyle";

export default function Home() {
    const { theme } = useTheme();
    const [pulseActive, setPulseActive] = useState(false);
    const [energyCost, setEnergyCost] = useState<string>("R$ 0.00");
    const [monthlyConsumption, setMonthlyConsumption] = useState<string>("0.0");
    const [expenseKwh, setExpenseKwh] = useState<number | null>(null);

    // Função para buscar account e expenseKwh do mês atual
    const fetchMonthData = useCallback(async () => {
        try {
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;
            
            const monthsData = await getEnergyMonths({
                year: currentYear,
                startMonth: currentMonth,
                endMonth: currentMonth,
            });
            
            
            if (monthsData && monthsData.length > 0) {
                const monthData = monthsData[0];
                
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
                const expenseKwhValue = (monthData as any).expenseKwh || monthData.consumeKwh || 0;
                if (expenseKwhValue !== undefined && expenseKwhValue !== null) {
                    // Armazenar o valor numérico para passar ao EnergyMeter
                    setExpenseKwh(typeof expenseKwhValue === 'number' ? expenseKwhValue : parseFloat(expenseKwhValue));
                    
                    // Formatar com mais casas decimais para valores pequenos
                    const formattedConsumption = typeof expenseKwhValue === 'number' 
                        ? expenseKwhValue < 1 
                            ? expenseKwhValue.toFixed(5) // Para valores < 1, mostrar 5 casas decimais
                            : expenseKwhValue.toFixed(1) // Para valores >= 1, mostrar 1 casa decimal
                        : expenseKwhValue.toString();
                    setMonthlyConsumption(formattedConsumption);
                }
            }
        } catch (err) {
            console.error('Erro ao buscar dados do mês:', err);
        }
    }, []);

    // Buscar dados na montagem inicial
    useEffect(() => {
        fetchMonthData();
    }, [fetchMonthData]);

    return (
        <SafeScreen>
            <ScrollView>
                <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                    <Header />

                    <View style={styles.content}>
                        <View style={styles.pulseRow}>
                            <PulseWebSocketLed
                                onPulse={(rawMessage) => {
                                    setPulseActive(true);
                                    setTimeout(() => setPulseActive(false), 150); 
                                    fetchMonthData();
                                }}
                            />
                        </View>

                        <View style={{ alignItems: "center", marginTop: 20 }}>
                            <EnergyMeter pulseActive={pulseActive} expenseKwh={expenseKwh} />
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


