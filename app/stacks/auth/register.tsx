import { useTheme } from "@/app/context/ThemeContext";
import useAuth from "@/app/hooks/useAuth";
import SafeScreen from "@/app/SafeScreen";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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

interface ValidationErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

export default function RegisterScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { register } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Validação de email
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Validação de força da senha
    const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
        if (pwd.length === 0) return { strength: 0, label: "", color: "" };

        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (/[a-z]/.test(pwd)) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

        if (strength <= 2) return { strength, label: "Fraca", color: "#e74c3c" };
        if (strength === 3) return { strength, label: "Média", color: "#f39c12" };
        return { strength, label: "Forte", color: "#27ae60" };
    };

    // Validação em tempo real
    useEffect(() => {
        const newErrors: ValidationErrors = {};

        if (touched.name && !name.trim()) {
            newErrors.name = "Nome é obrigatório";
        }

        if (touched.email) {
            if (!email.trim()) {
                newErrors.email = "Email é obrigatório";
            } else if (!validateEmail(email)) {
                newErrors.email = "Email inválido";
            }
        }

        if (touched.password) {
            if (!password) {
                newErrors.password = "Senha é obrigatória";
            } else if (password.length < 8) {
                newErrors.password = "Senha deve ter no mínimo 8 caracteres";
            } else if (!/[A-Z]/.test(password)) {
                newErrors.password = "Senha deve conter pelo menos uma letra maiúscula";
            } else if (!/[0-9]/.test(password)) {
                newErrors.password = "Senha deve conter pelo menos um número";
            } else if (!/[^a-zA-Z0-9]/.test(password)) {
                newErrors.password = "Senha deve conter pelo menos um símbolo";
            }
        }

        if (touched.confirmPassword) {
            if (!confirmPassword) {
                newErrors.confirmPassword = "Confirme sua senha";
            } else if (password !== confirmPassword) {
                newErrors.confirmPassword = "As senhas não coincidem";
            }
        }

        setErrors(newErrors);
    }, [name, email, password, confirmPassword, touched]);

    const handleBlur = (field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const handleRegister = async () => {
        // Marcar todos os campos como tocados
        setTouched({ name: true, email: true, password: true, confirmPassword: true });

        // Validação final
        if (!name.trim() || !email.trim() || !password || !confirmPassword) {
            Alert.alert("Erro", "Por favor, preencha todos os campos");
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert("Erro", "Por favor, insira um email válido");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Erro", "As senhas não coincidem");
            return;
        }

        if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
            Alert.alert("Erro", "A senha não atende aos requisitos de segurança");
            return;
        }

        if (!agreeTerms) {
            Alert.alert("Atenção", "Você precisa aceitar os termos de uso para continuar");
            return;
        }

        setLoading(true);

        try {
            await register({ name, email, password });
            router.replace("/tabs/home");
        } catch (err: any) {
            Alert.alert("Erro", err?.message || "Não foi possível criar conta");
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = getPasswordStrength(password);
    const colors = theme.colors;
    const isFormValid = 
        name.trim() && 
        validateEmail(email) && 
        password && 
        confirmPassword && 
        password === confirmPassword &&
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^a-zA-Z0-9]/.test(password) &&
        agreeTerms &&
        Object.keys(errors).length === 0;

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
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Junte-se à plataforma de análise energética</Text>
                    </View>

                    {/* FORM */}
                    <View style={styles.form}>

                        {/* Nome */}
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Nome Completo</Text>
                        <TextInput
                            style={[
                                styles.input,
                                { 
                                    backgroundColor: colors.surface, 
                                    color: colors.text,
                                    borderWidth: errors.name ? 1 : 0,
                                    borderColor: errors.name ? "#e74c3c" : "transparent",
                                },
                            ]}
                            placeholder="Digite seu nome completo"
                            placeholderTextColor={colors.textTertiary}
                            value={name}
                            onChangeText={setName}
                            onBlur={() => handleBlur("name")}
                            autoCapitalize="words"
                        />
                        {errors.name && (
                            <Text style={styles.errorText}>{errors.name}</Text>
                        )}

                        {/* Email */}
                        <Text style={[styles.label, { color: colors.textSecondary, marginTop: 16 }]}>E-mail</Text>
                        <TextInput
                            style={[
                                styles.input,
                                { 
                                    backgroundColor: colors.surface, 
                                    color: colors.text,
                                    borderWidth: errors.email ? 1 : 0,
                                    borderColor: errors.email ? "#e74c3c" : "transparent",
                                },
                            ]}
                            placeholder="seu@email.com"
                            placeholderTextColor={colors.textTertiary}
                            value={email}
                            onChangeText={setEmail}
                            onBlur={() => handleBlur("email")}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />
                        {errors.email && (
                            <Text style={styles.errorText}>{errors.email}</Text>
                        )}

                        {/* Senha */}
                        <Text style={[styles.label, { color: colors.textSecondary, marginTop: 16 }]}>Senha</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[
                                    styles.input,
                                    { 
                                        flex: 1, 
                                        backgroundColor: colors.surface, 
                                        color: colors.text,
                                        borderWidth: errors.password ? 1 : 0,
                                        borderColor: errors.password ? "#e74c3c" : "transparent",
                                    },
                                ]}
                                placeholder="Crie uma senha segura"
                                placeholderTextColor={colors.textTertiary}
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                onBlur={() => handleBlur("password")}
                                autoComplete="password-new"
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

                        {/* Indicador de força da senha */}
                        {password.length > 0 && (
                            <View style={styles.passwordStrengthContainer}>
                                <View style={styles.passwordStrengthBar}>
                                    <View 
                                        style={[
                                            styles.passwordStrengthFill,
                                            { 
                                                width: `${(passwordStrength.strength / 5) * 100}%`,
                                                backgroundColor: passwordStrength.color,
                                            }
                                        ]} 
                                    />
                                </View>
                                {passwordStrength.label && (
                                    <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>Força: {passwordStrength.label}</Text>
                                )}
                            </View>
                        )}

                        {errors.password && (
                            <Text style={styles.errorText}>{errors.password}</Text>
                        )}

                        {!errors.password && password.length > 0 && (
                            <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 4 }}>Mín. 8 caracteres, maiúscula, número e símbolo</Text>
                        )}

                        {/* Confirmar Senha */}
                        <Text style={[styles.label, { color: colors.textSecondary, marginTop: 16 }]}>Confirmar Senha</Text>

                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[
                                    styles.input,
                                    { 
                                        flex: 1, 
                                        backgroundColor: colors.surface, 
                                        color: colors.text,
                                        borderWidth: errors.confirmPassword ? 1 : 0,
                                        borderColor: errors.confirmPassword ? "#e74c3c" : "transparent",
                                    },
                                ]}
                                placeholder="Digite a senha novamente"
                                placeholderTextColor={colors.textTertiary}
                                secureTextEntry={!showPassword2}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                onBlur={() => handleBlur("confirmPassword")}
                                autoComplete="password-new"
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
                        {errors.confirmPassword && (
                            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                        )}
                        {!errors.confirmPassword && confirmPassword.length > 0 && password === confirmPassword && (
                            <View style={styles.successRow}>
                                <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                                <Text style={styles.successText}>Senhas coincidem</Text>
                            </View>
                        )}

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

                            <Text style={{ color: colors.textSecondary, marginLeft: 8, fontSize: 13 }}>
                                Eu concordo com os <Text style={{ color: colors.primary }}>Termos de Uso</Text> e <Text style={{ color: colors.primary }}>Política de Privacidade</Text>
                            </Text>
                        </View>

                        {/* BOTÃO CRIAR CONTA */}
                        <TouchableOpacity
                            style={[
                                styles.createButton,
                                {
                                    backgroundColor: isFormValid
                                        ? colors.buttonPrimary
                                        : colors.textTertiary + "40",
                                    opacity: isFormValid ? 1 : 0.6,
                                },
                            ]}
                            disabled={!isFormValid || loading}
                            onPress={handleRegister}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.buttonText} />
                            ) : (
                                <Text style={[styles.createButtonText, { color: isFormValid ? colors.buttonText : colors.textTertiary }]}>Criar Conta</Text>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <Text style={[styles.orText, { color: colors.textSecondary, marginVertical: 22 }]}>ou continue com</Text>

                        {/* SOCIAL LOGIN */}
                        <View style={styles.socialRow}>
                            <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.surface }] }>
                                <FontAwesome name="google" size={18} color={colors.text} />
                                <Text style={[styles.socialText, { color: colors.text }]}>Google</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.surface }] }>
                                <FontAwesome name="facebook" size={18} color={colors.text} />
                                <Text style={[styles.socialText, { color: colors.text }]}>Facebook</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Link Login */}
                        <View style={styles.loginRow}>
                            <Text style={{ color: colors.textSecondary }}>Já tem uma conta? </Text>
                            <TouchableOpacity onPress={() => router.push("/stacks/auth/login") }>
                                <Text style={{ color: colors.primary }}>Fazer login</Text>
                            </TouchableOpacity>
                        </View>

                        {/* RODAPÉ */}
                        <Text style={[ styles.footer, { color: colors.textTertiary, marginTop: 30 } ]}>
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
    logoBox: { padding: 14, borderRadius: 12, marginBottom: 10 },
    title: { fontSize: 22, fontWeight: "bold" },
    subtitle: { fontSize: 13, marginTop: 4, textAlign: "center" },
    form: { width: "100%", marginTop: 10 },
    label: { fontSize: 14, marginBottom: 6 },
    input: { borderRadius: 8, paddingVertical: 14, paddingHorizontal: 16, fontSize: 15 },
    passwordContainer: { flexDirection: "row", alignItems: "center" },
    eyeBtn: { position: "absolute", right: 12 },
    termsRow: { flexDirection: "row", alignItems: "center", marginTop: 18, marginBottom: 18 },
    createButton: { paddingVertical: 15, borderRadius: 10, alignItems: "center", marginTop: 10 },
    createButtonText: { fontWeight: "bold", fontSize: 15 },
    orText: { textAlign: "center", fontSize: 13 },
    socialRow: { flexDirection: "row", justifyContent: "space-between" },
    socialButton: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderRadius: 10, width: "48%", justifyContent: "center" },
    socialText: { fontSize: 14 },
    loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 22 },
    footer: { textAlign: "center", fontSize: 11, lineHeight: 16 },
    errorText: { color: "#e74c3c", fontSize: 12, marginTop: 4, marginLeft: 4 },
    passwordStrengthContainer: { marginTop: 8 },
    passwordStrengthBar: { height: 4, backgroundColor: "#e0e0e0", borderRadius: 2, overflow: "hidden", marginBottom: 4 },
    passwordStrengthFill: { height: "100%", borderRadius: 2 },
    passwordStrengthText: { fontSize: 12, fontWeight: "500", marginTop: 2 },
    successRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 6 },
    successText: { color: "#27ae60", fontSize: 12 },
});

