import useAuth from "@/app/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Gear, Moon, PencilSimple, SignOut, Sun } from "phosphor-react-native";
import React, { useState } from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ModalBLEConnection from "../components/ModalBLEConnection";
import { useTheme } from "../context/ThemeContext";
import { profileStyles as styles } from "./styles/profileStyle";

export default function Profile() {
    const router = useRouter();
    const { theme, themeMode, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const [allNotifications, setAllNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    const dynamicStyles = {
        container: { backgroundColor: theme.colors.background },
        header: { backgroundColor: theme.colors.header },
        headerTitle: { color: theme.colors.text },
        card: { backgroundColor: theme.colors.card },
        profileImage: { backgroundColor: theme.colors.primaryBackground },
        editIcon: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.card,
        },
        userName: { color: theme.colors.text },
        userEmail: { color: theme.colors.text },
        userPhone: { color: theme.colors.text },
        metricsRow: { borderTopColor: theme.colors.divider },
        metricValue: { color: theme.colors.text },
        metricLabel: { color: theme.colors.textSecondary },
        cardTitle: { color: theme.colors.text },
        goalLabel: { color: theme.colors.text },
        goalValue: { color: theme.colors.text },
        progressBar: { backgroundColor: theme.colors.progressBackground },
        progressFill: { backgroundColor: theme.colors.progressFill },
        progressText: { color: theme.colors.textSecondary },
        updateButton: { backgroundColor: theme.colors.buttonPrimary },
        updateButtonText: { color: theme.colors.buttonText },
        notificationTitle: { color: theme.colors.text },
        notificationDescription: { color: theme.colors.textSecondary },
    };

    const handleSignOut = async () => {
        await logout();
        router.replace("/stacks/auth/login");
    }

    const handleConfinguration = () => {
        router.push("/stacks/BLEScreen");
    }

    return (

        <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={["top"]}>
            <View style={[styles.header, dynamicStyles.header]}>
                <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Perfil</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
                        {themeMode === "light" ? (
                            <Moon size={24} color={theme.colors.text} weight="regular" />
                        ) : (
                            <Sun size={24} color={theme.colors.text} weight="regular" />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleConfinguration}>
                        <Gear size={24} color={theme.colors.text} weight="regular" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.card, dynamicStyles.card]}>
                    <View style={styles.profileSection}>
                        <View style={styles.profileImageContainer}>
                            <View style={[styles.profileImage, dynamicStyles.profileImage]}>
                                <Ionicons
                                    name="person"
                                    size={40}
                                    color={theme.colors.primary}
                                />
                            </View>
                            <TouchableOpacity style={[styles.editIcon, dynamicStyles.editIcon]}>
                                <PencilSimple size={12} color={theme.colors.buttonText} weight="fill" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={[styles.userName, dynamicStyles.userName]}>{user?.name ?? 'Patric Araujo'}</Text>
                            <Text style={[styles.userEmail, dynamicStyles.userEmail]}>{user?.email ?? 'patric.patric@gmail.com'}</Text>
                            <Text style={[styles.userPhone, dynamicStyles.userPhone]}>
                                (85) 94002-8922
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.metricsRow, dynamicStyles.metricsRow]}>
                        <View style={styles.metric}>
                            <Text style={[styles.metricValue, dynamicStyles.metricValue]}>12</Text>
                            <Text style={[styles.metricLabel, dynamicStyles.metricLabel]}>Dispositivos</Text>
                        </View>
                        <View style={styles.metric}>
                            <Text style={[styles.metricValue, dynamicStyles.metricValue]}>8.2kWh</Text>
                            <Text style={[styles.metricLabel, dynamicStyles.metricLabel]}>Hoje</Text>
                        </View>
                    </View>
                </View>

                {/* Energy Goal Card */}
                {/* <View style={[styles.card, dynamicStyles.card]}>
                    <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>Meta Energética</Text>
                    <View style={styles.goalHeader}>
                        <Text style={[styles.goalLabel, dynamicStyles.goalLabel]}>Meta mensal</Text>
                        <Text style={[styles.goalValue, dynamicStyles.goalValue]}>850 kWh</Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, dynamicStyles.progressBar]}>
                            <View style={[styles.progressFill, dynamicStyles.progressFill, { width: "85%" }]} />
                        </View>
                    </View>
                    <View style={styles.progressInfo}>
                        <Text style={[styles.progressText, dynamicStyles.progressText]}>720 kWh usado</Text>
                        <Text style={[styles.progressText, dynamicStyles.progressText]}>85% da meta</Text>
                    </View>
                    <TouchableOpacity style={[styles.updateButton, dynamicStyles.updateButton]}>
                        <Text style={[styles.updateButtonText, dynamicStyles.updateButtonText]}>Atualizar meta</Text>
                    </TouchableOpacity>
                </View> */}

                {/* Notifications Card */}
                <View style={[styles.card, dynamicStyles.card]}>
                    {/* <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>Notificações</Text>
                    <View style={styles.notificationItem}>
                        <View style={styles.notificationContent}>
                            <Text style={[styles.notificationTitle, dynamicStyles.notificationTitle]}>
                                Todas as notificações
                            </Text>
                            <Text style={[styles.notificationDescription, dynamicStyles.notificationDescription]}>
                                Ativar ou desativar todas as notificações
                            </Text>
                        </View>
                        <Switch
                            value={allNotifications}
                            onValueChange={setAllNotifications}
                            trackColor={{ false: theme.colors.switchInactive, true: theme.colors.switchActive }}
                            thumbColor={theme.colors.buttonText}
                            ios_backgroundColor={theme.colors.switchInactive}
                        />
                    </View> */}


                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.colors.primary }]}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
                            Conectar ESP32 via BLE
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Sign Out Button */}
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <SignOut size={20} color={theme.colors.error} weight="regular" />
                    <Text style={[styles.signOutText, { color: theme.colors.error }]}>Sair</Text>
                </TouchableOpacity>
            </ScrollView>

            <ModalBLEConnection
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </SafeAreaView>
    );
}


