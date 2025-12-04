import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Header from "../components/Header";
import { useTheme } from "../context/ThemeContext";
import SafeScreen from "../SafeScreen";

export default function Analisty() {
    const { theme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <SafeScreen>
            <ScrollView>

                <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                    <Header />
                    <View style={styles.content}>


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
        paddingHorizontal: 10,
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
    button: {
        marginTop: 20,
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
        backgroundColor: '#007AFF',
    }
});