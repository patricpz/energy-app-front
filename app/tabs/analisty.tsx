import { StyleSheet, Text, View } from "react-native";
import GraphicMeter from "../components/GraphicMeter";
import Header from "../components/Header";



export default function Analisty() {

    const data = [{ value: 50 }, { value: 80 }, { value: 90 }, { value: 70 }]

    const lineData = [
        { value: 0, dataPointText: '0' },
        { value: 20, dataPointText: '20' },
        { value: 18, dataPointText: '18' },
        { value: 40, dataPointText: '40' },
        { value: 36, dataPointText: '36' },
        { value: 60, dataPointText: '60' },
        { value: 54, dataPointText: '54' },
        { value: 85, dataPointText: '85' }
    ];


    return (
        <View style={styles.container}>
            <Header />

            <View style={styles.content}>
                <Text style={styles.title}>Analisty Screen</Text>
                <GraphicMeter />



            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0D1117",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 24,
        color: "#FFFFFF",
        fontWeight: "600",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: "#8A99A6",
    },
});