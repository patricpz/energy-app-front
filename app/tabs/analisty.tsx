import { ScrollView, StyleSheet, Text, View } from "react-native";
import GraphicMeter from "../components/GraphicMeter";
import Header from "../components/Header";
import { useTheme } from "../context/ThemeContext";
import SafeScreen from "../SafeScreen";

export default function Analisty() {
    const { theme } = useTheme();

    return (
        <SafeScreen>
            <ScrollView>

                <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                    <Header />

                    <View style={styles.content}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>Analisty Screen</Text>
                        <GraphicMeter />

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
});