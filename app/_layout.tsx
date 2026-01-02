import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { PulseCounterProvider } from "./context/PulseCounterContext";

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AuthProvider>
                    <PulseCounterProvider>
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="index" options={{ headerShown: false }} />
                            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
                            <Stack.Screen name="auth/register" options={{ headerShown: false }} />
                            <Stack.Screen name="tabs/_layout" options={{ headerShown: false }} />
                        </Stack>
                    </PulseCounterProvider>
                </AuthProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}