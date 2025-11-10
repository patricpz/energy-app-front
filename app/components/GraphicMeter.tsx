import { StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

export default function GraphicMeter() {
    const lineData = [
        { value: 15, label: 'Mon' },
        { value: 18, label: 'Tue' },
        { value: 12, label: 'Wed' },
        { value: 22, label: 'Thu' },
        { value: 20, label: 'Fri' },
        { value: 14, label: 'Sat' },
        { value: 11, label: 'Sun' },
    ];

    return (
        <View
            style={{
                borderRadius: 16,
                padding: 16,
                shadowColor: "#000",
                shadowOpacity: 0.3,
                shadowRadius: 10,
                margin: 10,
            }}
        >
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                    Consumo Tempo Real
                </Text>
                <Text style={{ color: "#94A3B8", fontSize: 13 }}>Últimos 7 dias ●</Text>
            </View>

            <Text style={{ color: "#94A3B8", marginTop: 6 }}>
                Média: <Text style={{ color: "#22c55e", fontWeight: "600" }}>24.8 kWh</Text>
            </Text>

            <LineChart
                data={lineData}
                curved
                color="#22c55e"
                thickness={3}
                hideDataPoints={false}
                dataPointsColor="#22c55e"
                dataPointsWidth={10}
                dataPointsHeight={10}
                startOpacity={0.3}
                endOpacity={0.05}
                yAxisTextStyle={{ color: "#94A3B8" }}
                xAxisLabelTextStyle={{ color: "#94A3B8", fontSize: 12 }}
                hideRules
                hideYAxisText
                noOfSections={4}
                xAxisColor="transparent"
                yAxisColor="transparent"
                areaChart
                startFillColor="#22c55e"
                endFillColor="#22c55e"
            />

            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                <View
                    style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: "#22c55e",
                        marginRight: 6,
                    }}
                />
                <Text style={{ color: "#94A3B8" }}>Consumo</Text>
                <Text style={{ color: "#94A3B8", marginLeft: "auto" }}>kWh</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    
})