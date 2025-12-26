import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AuthProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" options={{ headerShown: false }} />
                        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
                        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
                        <Stack.Screen name="tabs/_layout" options={{ headerShown: false }} />
                    </Stack>
                </AuthProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}