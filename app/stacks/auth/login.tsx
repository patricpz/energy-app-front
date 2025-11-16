import { useTheme } from "@/app/context/ThemeContext";
import SafeScreen from "@/app/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const LoginScreen = () => {
    const { theme } = useTheme();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();

    const handleLogin = () => {
        // if (!email || !password) {
        //   setError("Por favor, preencha todos os campos");
        //   return;
        // }

        setLoading(true);
        setError("");

        setTimeout(() => {
            setLoading(false);
            router.replace("/tabs/home");
            console.log("Login attempt with:", { email });

        }, 1500);
    };

    return (
        <SafeScreen>

        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                {/* Logo e título */}
                <View style={styles.header}>
                    <View style={[styles.logoContainer, { backgroundColor: theme.colors.primaryBackground }]}>
                        <Ionicons name="battery-half" size={28} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.appName, { color: theme.colors.text }]}>EnergyApp</Text>
                    <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                        Monitore e otimize seu consumo de energia.
                    </Text>
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {/* Email */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Email</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                        placeholder="Seu Email"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                {/* Senha */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Senha</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[styles.input, { flex: 1, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                            placeholder="Sua Senha"
                            placeholderTextColor={theme.colors.textTertiary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeButton}
                        >
                            <Ionicons
                                name={showPassword ? "eye-off" : "eye"}
                                size={20}
                                color={theme.colors.textTertiary}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Opções */}
                <View style={styles.optionsRow}>
                    <View style={styles.rememberRow}>
                        <Switch
                            value={remember}
                            onValueChange={setRemember}
                            trackColor={{ false: theme.colors.switchInactive, true: theme.colors.switchActive }}
                            thumbColor={remember ? theme.colors.buttonText : "#ccc"}
                        />
                        <Text style={[styles.rememberText, { color: theme.colors.textSecondary }]}>Lembre de mim</Text>
                    </View>

                    <TouchableOpacity>
                        <Text style={[styles.forgotText, { color: theme.colors.primary }]}>Esqueceu sua senha?</Text>
                    </TouchableOpacity>
                </View>

                {/* Botão de login */}
                <TouchableOpacity
                    style={[styles.loginButton, { backgroundColor: theme.colors.primary }, loading && styles.disabledButton]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.colors.buttonText} />
                    ) : (
                        <Text style={[styles.loginButtonText, { color: theme.colors.buttonText }]}>Entrar →</Text>
                    )}
                </TouchableOpacity>

                {/* Criar conta */}
                <View style={styles.signupRow}>
                    <Text style={[styles.signupText, { color: theme.colors.textSecondary }]}>Não tem uma conta? </Text>
                    <TouchableOpacity onPress={() => router.push("/stacks/auth/register")}>
                        <Text style={[styles.signupLink, { color: theme.colors.primary }]}>Criar uma conta</Text>
                    </TouchableOpacity>
                </View>

                {/* Rodapé */}
                <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
                    Ao iniciar sessão, você concorda com os nossos termos.{"\n"}
                    <Text style={[styles.linkText, { color: theme.colors.primary }]}>Termos de Serviço</Text> e{" "}
                    <Text style={[styles.linkText, { color: theme.colors.primary }]}>Política de Privacidade</Text>
                </Text>
                <Text style={[styles.dataInfo, { color: theme.colors.textTertiary }]}>
                    Seus dados de energia estão criptografados e seguros.
                </Text>
            </View>
        </KeyboardAvoidingView>
        </SafeScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    card: {
        borderRadius: 12,
        padding: 24,
        width: "100%",
        maxWidth: 380,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 6,
    },
    header: {
        alignItems: "center",
        marginBottom: 28,
    },
    logoContainer: {
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
    },
    appName: {
        fontSize: 22,
        fontWeight: "bold",
    },
    description: {
        fontSize: 13,
        textAlign: "center",
        marginTop: 6,
    },
    inputGroup: {
        marginBottom: 18,
    },
    label: {
        fontSize: 14,
        marginBottom: 6,
    },
    input: {
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 15,
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    eyeButton: {
        position: "absolute",
        right: 12,
    },
    optionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    rememberRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    rememberText: {
        fontSize: 13,
    },
    forgotText: {
        fontSize: 13,
        fontWeight: "500",
    },
    loginButton: {
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    disabledButton: {
        opacity: 0.7,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    signupRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
    },
    signupText: {
        fontSize: 13,
    },
    signupLink: {
        fontWeight: "600",
        fontSize: 13,
    },
    footerText: {
        fontSize: 11,
        textAlign: "center",
        marginTop: 28,
        lineHeight: 16,
    },
    linkText: {
        // Cor será aplicada dinamicamente
    },
    dataInfo: {
        fontSize: 11,
        textAlign: "center",
        marginTop: 6,
    },
    errorText: {
        color: "#e74c3c",
        textAlign: "center",
        marginBottom: 10,
    },
});

export default LoginScreen;
