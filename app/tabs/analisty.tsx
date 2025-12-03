import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Header from "../components/Header";
import ModalGlobal from "../components/ModalGlobal";
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
                        <Text style={[styles.title, { color: theme.colors.text }]}>Analisty Screen</Text>
                        <Pressable style={styles.button} onPress={() => setIsOpen(true)}>
                            <Text style={{ color: '#FFF' }}>Open Modal</Text>
                        </Pressable>
                        <ModalGlobal visible={isOpen} onClose={() => setIsOpen(false)} title="Configurações">
                            <Text style={{ color: "#888" }}>Aqui vai qualquer conteúdo.</Text>
                        </ModalGlobal>

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