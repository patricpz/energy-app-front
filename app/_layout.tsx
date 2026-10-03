import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./context/AuthContext";
import { PulseCounterProvider } from "./context/PulseCounterContext";
import { ThemeProvider } from "./context/ThemeContext";

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AuthProvider>
                    <PulseCounterProvider>
                        <Stack screenOptions={{ headerShown: false }} />
                    </PulseCounterProvider>
                </AuthProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}