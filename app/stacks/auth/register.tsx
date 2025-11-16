import { useTheme } from "@/app/context/ThemeContext";
import SafeScreen from "@/app/SafeScreen";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function RegisterScreen() {
    const { theme } = useTheme();
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = () => {
        if (!agreeTerms) return;
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            router.replace("/tabs/home");
        }, 1500);
    };

    const colors = theme.colors;

    return (
        <SafeScreen>

            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: colors.background }]}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 30 }}
                >
                    <View style={styles.header}>
                        {/* Logo */}
                        <View
                            style={[
                                styles.logoBox,
                                { backgroundColor: colors.primaryBackground },
                            ]}
                        >
                            <Ionicons name="flash-outline" size={32} color={colors.primary} />
                        </View>

                        <Text style={[styles.title, { color: colors.text }]}>Criar Conta</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Junte-se à plataforma de análise energética
                        </Text>
                    </View>

                    {/* FORM */}
                    <View style={styles.form}>

                        {/* Nome */}
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Nome Completo
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                { backgroundColor: colors.surface, color: colors.text },
                            ]}
                            placeholder="Digite seu nome completo"
                            placeholderTextColor={colors.textTertiary}
                            value={name}
                            onChangeText={setName}
                        />

                        {/* Email */}
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            E-mail
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                { backgroundColor: colors.surface, color: colors.text },
                            ]}
                            placeholder="seu@email.com"
                            placeholderTextColor={colors.textTertiary}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        {/* Senha */}
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Senha</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[
                                    styles.input,
                                    { flex: 1, backgroundColor: colors.surface, color: colors.text },
                                ]}
                                placeholder="Crie uma senha segura"
                                placeholderTextColor={colors.textTertiary}
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />

                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeBtn}
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off" : "eye"}
                                    size={20}
                                    color={colors.textTertiary}
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 4 }}>
                            Mín. 8 caracteres, maiúscula, número e símbolo
                        </Text>

                        {/* Confirmar Senha */}
                        <Text
                            style={[
                                styles.label,
                                { color: colors.textSecondary, marginTop: 16 },
                            ]}
                        >
                            Confirmar Senha
                        </Text>

                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[
                                    styles.input,
                                    { flex: 1, backgroundColor: colors.surface, color: colors.text },
                                ]}
                                placeholder="Digite a senha novamente"
                                placeholderTextColor={colors.textTertiary}
                                secureTextEntry={!showPassword2}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />

                            <TouchableOpacity
                                onPress={() => setShowPassword2(!showPassword2)}
                                style={styles.eyeBtn}
                            >
                                <Ionicons
                                    name={showPassword2 ? "eye-off" : "eye"}
                                    size={20}
                                    color={colors.textTertiary}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Aceitar termos */}
                        <View style={styles.termsRow}>
                            <Switch
                                value={agreeTerms}
                                onValueChange={setAgreeTerms}
                                trackColor={{
                                    false: colors.switchInactive,
                                    true: colors.switchActive,
                                }}
                                thumbColor={agreeTerms ? colors.buttonText : "#ccc"}
                            />

                            <Text
                                style={{
                                    color: colors.textSecondary,
                                    marginLeft: 8,
                                    fontSize: 13,
                                }}
                            >
                                Eu concordo com os{" "}
                                <Text style={{ color: colors.primary }}>Termos de Uso</Text> e{" "}
                                <Text style={{ color: colors.primary }}>
                                    Política de Privacidade
                                </Text>
                            </Text>
                        </View>

                        {/* BOTÃO CRIAR CONTA */}
                        <TouchableOpacity
                            style={[
                                styles.createButton,
                                {
                                    backgroundColor: agreeTerms
                                        ? colors.buttonPrimary
                                        : colors.textTertiary + "40",
                                },
                            ]}
                            disabled={!agreeTerms || loading}
                            onPress={handleRegister}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.buttonText} />
                            ) : (
                                <Text
                                    style={[
                                        styles.createButtonText,
                                        { color: colors.buttonText },
                                    ]}
                                >
                                    Criar Conta
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <Text
                            style={[
                                styles.orText,
                                { color: colors.textSecondary, marginVertical: 22 },
                            ]}
                        >
                            ou continue com
                        </Text>

                        {/* SOCIAL LOGIN */}
                        <View style={styles.socialRow}>
                            <TouchableOpacity
                                style={[
                                    styles.socialButton,
                                    { backgroundColor: colors.surface },
                                ]}
                            >
                                <FontAwesome name="google" size={18} color={colors.text} />
                                <Text style={[styles.socialText, { color: colors.text }]}>
                                    Google
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.socialButton,
                                    { backgroundColor: colors.surface },
                                ]}
                            >
                                <FontAwesome name="facebook" size={18} color={colors.text} />
                                <Text style={[styles.socialText, { color: colors.text }]}>
                                    Facebook
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Link Login */}
                        <View style={styles.loginRow}>
                            <Text style={{ color: colors.textSecondary }}>
                                Já tem uma conta?{" "}
                            </Text>
                            <TouchableOpacity onPress={() => router.push("/stacks/auth/login")}>
                                <Text style={{ color: colors.primary }}>Fazer login</Text>
                            </TouchableOpacity>
                        </View>

                        {/* RODAPÉ */}
                        <Text
                            style={[
                                styles.footer,
                                { color: colors.textTertiary, marginTop: 30 },
                            ]}
                        >
                            Suporte • Privacidade • Termos{"\n"}
                            © 2024 EnergyAnalytics. Todos os direitos reservados.
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeScreen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 20 },
    header: { alignItems: "center", marginBottom: 30 },
    logoBox: {
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
    },
    title: { fontSize: 22, fontWeight: "bold" },
    subtitle: { fontSize: 13, marginTop: 4, textAlign: "center" },
    form: { width: "100%", marginTop: 10 },
    label: { fontSize: 14, marginBottom: 6 },
    input: {
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 15,
    },
    passwordContainer: { flexDirection: "row", alignItems: "center" },
    eyeBtn: { position: "absolute", right: 12 },
    termsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 18,
        marginBottom: 18,
    },
    createButton: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    createButtonText: {
        fontWeight: "bold",
        fontSize: 15,
    },
    orText: {
        textAlign: "center",
        fontSize: 13,
    },
    socialRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    socialButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 12,
        borderRadius: 10,
        width: "48%",
        justifyContent: "center",
    },
    socialText: { fontSize: 14 },
    loginRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 22,
    },
    footer: {
        textAlign: "center",
        fontSize: 11,
        lineHeight: 16,
    },
});
