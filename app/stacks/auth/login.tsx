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
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.card}>
                {/* Logo e título */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="battery-half" size={28} color="#1ED760" />
                    </View>
                    <Text style={styles.appName}>EnergyApp</Text>
                    <Text style={styles.description}>
                        Monitore e otimize seu consumo de energia.
                    </Text>
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {/* Email */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Seu Email"
                        placeholderTextColor="#7A7A7A"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                {/* Senha */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Senha</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Sua Senha"
                            placeholderTextColor="#7A7A7A"
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
                                color="#7A7A7A"
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
                            trackColor={{ false: "#555", true: "#1ED760" }}
                            thumbColor={remember ? "#fff" : "#ccc"}
                        />
                        <Text style={styles.rememberText}>Lembre de mim</Text>
                    </View>

                    <TouchableOpacity>
                        <Text style={styles.forgotText}>Esqueceu sua senha?</Text>
                    </TouchableOpacity>
                </View>

                {/* Botão de login */}
                <TouchableOpacity
                    style={[styles.loginButton, loading && styles.disabledButton]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.loginButtonText}>Sign In →</Text>
                    )}
                </TouchableOpacity>

                {/* Criar conta */}
                <View style={styles.signupRow}>
                    <Text style={styles.signupText}>Não tem uma conta? </Text>
                    <TouchableOpacity>
                        <Text style={styles.signupLink}>Criar uma conta</Text>
                    </TouchableOpacity>
                </View>

                {/* Rodapé */}
                <Text style={styles.footerText}>
                    Ao iniciar sessão, você concorda com os nossos termos.{"\n"}
                    <Text style={styles.linkText}>Termos de Serviço</Text> e{" "}
                    <Text style={styles.linkText}>Política de Privacidade</Text>
                </Text>
                <Text style={styles.dataInfo}>
                    Seus dados de energia estão criptografados e seguros.
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0D1117",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: "#161B22",
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
        backgroundColor: "#1ED76033",
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
    },
    appName: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    description: {
        color: "#A3A3A3",
        fontSize: 13,
        textAlign: "center",
        marginTop: 6,
    },
    inputGroup: {
        marginBottom: 18,
    },
    label: {
        color: "#C3C3C3",
        fontSize: 14,
        marginBottom: 6,
    },
    input: {
        backgroundColor: "#1F242B",
        color: "#FFFFFF",
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
        color: "#C3C3C3",
        fontSize: 13,
    },
    forgotText: {
        color: "#1ED760",
        fontSize: 13,
        fontWeight: "500",
    },
    loginButton: {
        backgroundColor: "#1ED760",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    disabledButton: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
    },
    signupRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
    },
    signupText: {
        color: "#A3A3A3",
        fontSize: 13,
    },
    signupLink: {
        color: "#1ED760",
        fontWeight: "600",
        fontSize: 13,
    },
    footerText: {
        color: "#707070",
        fontSize: 11,
        textAlign: "center",
        marginTop: 28,
        lineHeight: 16,
    },
    linkText: {
        color: "#1ED760",
    },
    dataInfo: {
        color: "#555",
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
