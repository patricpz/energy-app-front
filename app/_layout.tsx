import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/modules/auth/context/AuthContext";
import { PulseCounterProvider } from "@/modules/energy/context/PulseCounterContext";
import { ThemeProvider } from "@/shared/theme/ThemeContext";

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