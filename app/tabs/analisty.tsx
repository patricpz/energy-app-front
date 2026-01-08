import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Header from "../components/Header";
import { useTheme } from "../context/ThemeContext";
import SafeScreen from "../SafeScreen";
import bleService, { BLEConnectionStatus, BLEDevice } from "../services/blePLXService";

export default function Analisty() {
    const { theme } = useTheme();
    const [status, setStatus] = useState<BLEConnectionStatus>('desconectado');
    const [devices, setDevices] = useState<BLEDevice[]>([]);
    const [connectedDeviceId, setConnectedDeviceId] = useState<string | null>(null);
    const [wifiSSID, setWifiSSID] = useState('');
    const [wifiPassword, setWifiPassword] = useState('');
    const [logs, setLogs] = useState<string[]>([]);
    const [isScanning, setIsScanning] = useState(false);

    // Adicionar log
    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        setLogs((prev) => [logMessage, ...prev].slice(0, 30));
    };

    // Inicializar BLE quando o componente montar
    useEffect(() => {
        initializeBLE();
        return () => {
            cleanupBLE();
        };
    }, []);

    const initializeBLE = async () => {
        try {
            addLog('🔧 Inicializando BLE...');
            setStatus('inicializando');

            // Inicializar BleManager
            const initialized = await bleService.initialize();
            if (!initialized) {
                throw new Error('Falha ao inicializar BleManager');
            }

            // Configurar callback para receber dados do ESP32
            bleService.setOnDataReceived((data: string, json?: any) => {
                addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                addLog('📥 DADOS RECEBIDOS DO ESP32');
                addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                addLog(`📥 Dados: ${data}`);
                
                if (json) {
                    addLog(`📥 JSON: ${JSON.stringify(json)}`);
                    
                    // Resposta automática baseada no comando recebido
                    handleAutomaticResponse(json);
                } else {
                    // Se não for JSON, apenas log
                    addLog('📥 Dados recebidos (não é JSON)');
                }
            });

            addLog('✅ BLE inicializado com sucesso');
            addLog('✅ Callback de recebimento configurado');
            setStatus('desconectado');
        } catch (error: any) {
            addLog(`❌ Erro ao inicializar: ${error?.message || 'Erro desconhecido'}`);
            setStatus('erro');
            Alert.alert('Erro', `Falha ao inicializar BLE: ${error?.message || 'Erro desconhecido'}`);
        }
    };

    // Função para resposta automática quando receber dados do ESP32
    const handleAutomaticResponse = async (json: any) => {
        try {
            if (!bleService.isConnected()) {
                return;
            }

            // Exemplo: Se ESP32 enviar um comando, responder automaticamente
            if (json.cmd === 4) {
                // ESP32 pediu lista de WiFis - podemos enviar uma resposta
                addLog('📤 Resposta automática: Lista de WiFis solicitada');
            } else if (json.status === 'ok') {
                // ESP32 confirmou recebimento - podemos enviar próximo comando
                addLog('📤 ESP32 confirmou recebimento');
            } else if (json.error) {
                // ESP32 reportou erro
                addLog(`⚠️ ESP32 reportou erro: ${json.error}`);
            }
        } catch (error: any) {
            console.error('Erro na resposta automática:', error?.message || 'Erro desconhecido');
        }
    };

    const cleanupBLE = async () => {
        try {
            await bleService.cleanup();
            addLog('🧹 Recursos BLE limpos');
        } catch (error: any) {
            console.error('Erro ao limpar recursos:', error);
        }
    };

    const startScan = async () => {
        try {
            addLog('🔍 Iniciando scan de dispositivos BLE...');
            setStatus('escaneando');
            setIsScanning(true);
            setDevices([]);

            await bleService.startScan((device) => {
                setDevices((prev) => {
                    const exists = prev.some((d) => d.id === device.id);
                    if (exists) return prev;
                    
                    // Log especial se for o ESP32 esperado
                    if (device.name && device.name.toLowerCase().includes('esp32')) {
                        addLog(`🔍 ESP32 encontrado: ${device.name} (${device.id.substring(0, 8)}...)`);
                    } else {
                        addLog(`🔍 Dispositivo encontrado: ${device.name} (${device.id.substring(0, 8)}...)`);
                    }
                    
                    return [...prev, device];
                });
            });

            // Parar scan automaticamente após 10 segundos
            setTimeout(() => {
                bleService.stopScan();
                setStatus('desconectado');
                setIsScanning(false);
                addLog('✅ Scan finalizado');
            }, 10000);
        } catch (error: any) {
            addLog(`❌ Erro no scan: ${error.message}`);
            setStatus('erro');
            setIsScanning(false);
            Alert.alert('Erro', `Falha ao escanear: ${error.message}`);
        }
    };

    const stopScan = () => {
        try {
            bleService.stopScan();
            setStatus('desconectado');
            setIsScanning(false);
            addLog('⏹️ Scan parado manualmente');
        } catch (error: any) {
            addLog(`❌ Erro ao parar scan: ${error?.message || 'Erro desconhecido'}`);
        }
    };

    const connectToDevice = async (deviceId: string) => {
        try {
            addLog(`🔌 Conectando ao dispositivo ${deviceId.substring(0, 8)}...`);
            setStatus('conectando');

            await bleService.connect(deviceId);
            setConnectedDeviceId(deviceId);
            setStatus('conectado');
            addLog('✅ Conectado com sucesso!');
            addLog('✅ Serviços descobertos e prontos para envio');
        } catch (error: any) {
            const errorMessage = error?.message || String(error);
            addLog(`❌ Erro ao conectar: ${errorMessage}`);
            console.error('Erro completo:', error);
            setStatus('erro');
            Alert.alert('Erro de Conexão', `Falha ao conectar ao dispositivo:\n\n${errorMessage}\n\nVerifique:\n- Se o dispositivo está próximo\n- Se o Bluetooth está ligado\n- Se os UUIDs estão corretos`);
        }
    };

    const disconnect = async () => {
        try {
            await bleService.disconnect();
            setConnectedDeviceId(null);
            setStatus('desconectado');
            addLog('🔌 Desconectado');
        } catch (error: any) {
            addLog(`❌ Erro ao desconectar: ${error.message}`);
        }
    };

    const sendWiFiCredentials = async () => {
        if (!wifiSSID.trim() || !wifiPassword.trim()) {
            Alert.alert('Atenção', 'Preencha o SSID e a senha do WiFi');
            return;
        }

        if (!bleService.isConnected()) {
            Alert.alert('Atenção', 'Conecte-se a um dispositivo primeiro');
            return;
        }

        try {
            addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            addLog('📤 ENVIANDO CREDENCIAIS WiFi');
            addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            addLog(`📤 SSID: ${wifiSSID.trim()}`);
            addLog(`📤 Password: ${'*'.repeat(wifiPassword.length)}`);
            addLog(`📤 JSON: {"ssid":"${wifiSSID.trim()}","password":"${wifiPassword.trim()}"}`);

            await bleService.configureWiFi(wifiSSID.trim(), wifiPassword.trim());

            addLog('✅ Credenciais WiFi enviadas com sucesso!');
            addLog('✅ Verifique o ESP32 para confirmar recebimento');
            Alert.alert('Sucesso', 'Credenciais WiFi enviadas para o ESP32!\n\nVerifique o ESP32 para confirmar.');
        } catch (error: any) {
            const errorMessage = error?.message || String(error);
            addLog(`❌ Erro ao enviar: ${errorMessage}`);
            console.error('Erro completo ao enviar:', error);
            Alert.alert(
                'Erro ao Enviar', 
                `Falha ao enviar credenciais:\n\n${errorMessage}\n\nVerifique:\n- Se está conectado ao dispositivo\n- Se os UUIDs estão corretos\n- Se o ESP32 está pronto para receber`
            );
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'conectado':
                return theme.colors.success;
            case 'conectando':
            case 'escaneando':
            case 'inicializando':
                return theme.colors.warning;
            case 'erro':
                return theme.colors.error;
            default:
                return theme.colors.textSecondary;
        }
    };

    return (
        <SafeScreen>
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Header />
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>
                            Conexão BLE com ESP32
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                            Configure o WiFi do ESP32 via Bluetooth Low Energy
                        </Text>

                        {/* Status */}
                        <View style={[styles.statusCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <View style={styles.statusRow}>
                                <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
                                    Status:
                                </Text>
                                <View style={styles.statusValueContainer}>
                                    <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                                    <Text style={[styles.statusValue, { color: getStatusColor() }]}>
                                        {status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Botões de controle */}
                        <View style={styles.buttonRow}>
                            {isScanning ? (
                                <TouchableOpacity 
                                    style={[styles.button, { backgroundColor: theme.colors.warning }]} 
                                    onPress={stopScan}
                                >
                                    <Ionicons name="stop-circle" size={20} color={theme.colors.buttonText} />
                                    <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
                                        Parar Scan
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity 
                                    style={[styles.button, { backgroundColor: theme.colors.buttonPrimary }]} 
                                    onPress={startScan}
                                >
                                    <Ionicons name="search" size={20} color={theme.colors.buttonText} />
                                    <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
                                        Escanear BLE
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {bleService.isConnected() && (
                                <TouchableOpacity 
                                    style={[styles.button, styles.buttonSecondary, { 
                                        borderColor: theme.colors.error,
                                        backgroundColor: 'transparent'
                                    }]} 
                                    onPress={disconnect}
                                >
                                    <Ionicons name="close-circle" size={20} color={theme.colors.error} />
                                    <Text style={[styles.buttonText, { color: theme.colors.error }]}>
                                        Desconectar
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Lista de dispositivos */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                                Dispositivos Encontrados ({devices.length})
                            </Text>
                            {devices.length === 0 ? (
                                <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
                                    <Ionicons name="bluetooth-outline" size={32} color={theme.colors.textTertiary} />
                                    <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>
                                        Nenhum dispositivo encontrado.{'\n'}Toque em "Escanear BLE" para procurar.
                                    </Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={devices}
                                    keyExtractor={(item) => item.id}
                                    scrollEnabled={false}
                                    renderItem={({ item }) => (
                                        <View style={[styles.deviceCard, { 
                                            backgroundColor: theme.colors.card, 
                                            borderColor: theme.colors.border 
                                        }]}>
                                            <View style={styles.deviceInfo}>
                                                <Ionicons 
                                                    name="bluetooth" 
                                                    size={24} 
                                                    color={connectedDeviceId === item.id ? theme.colors.success : theme.colors.primary} 
                                                />
                                                <View style={styles.deviceDetails}>
                                                    <Text style={[styles.deviceName, { color: theme.colors.text }]}>
                                                        {item.name}
                                                    </Text>
                                                    <Text style={[styles.deviceId, { color: theme.colors.textSecondary }]}>
                                                        {item.id.substring(0, 17)}...
                                                    </Text>
                                                    <Text style={[styles.deviceRssi, { color: theme.colors.textTertiary }]}>
                                                        RSSI: {item.rssi} dBm
                                                    </Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity
                                                style={[
                                                    styles.connectButton,
                                                    { 
                                                        backgroundColor: connectedDeviceId === item.id 
                                                            ? theme.colors.success 
                                                            : theme.colors.buttonPrimary 
                                                    }
                                                ]}
                                                onPress={() =>
                                                    connectedDeviceId === item.id 
                                                        ? disconnect() 
                                                        : connectToDevice(item.id)
                                                }
                                                disabled={status === 'conectando'}
                                            >
                                                {status === 'conectando' && connectedDeviceId !== item.id ? (
                                                    <ActivityIndicator size="small" color={theme.colors.buttonText} />
                                                ) : (
                                                    <Text style={[styles.connectButtonText, { color: theme.colors.buttonText }]}>
                                                        {connectedDeviceId === item.id ? 'Conectado' : 'Conectar'}
                                                    </Text>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                            )}
                        </View>

                        {/* Formulário WiFi */}
                        {bleService.isConnected() && (
                            <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                                    Configurar WiFi no ESP32
                                </Text>

                                <TextInput
                                    style={[styles.input, { 
                                        borderColor: theme.colors.border,
                                        color: theme.colors.text,
                                        backgroundColor: theme.colors.surface
                                    }]}
                                    placeholder="SSID do WiFi"
                                    placeholderTextColor={theme.colors.textTertiary}
                                    value={wifiSSID}
                                    onChangeText={setWifiSSID}
                                    autoCapitalize="none"
                                />

                                <TextInput
                                    style={[styles.input, { 
                                        borderColor: theme.colors.border,
                                        color: theme.colors.text,
                                        backgroundColor: theme.colors.surface
                                    }]}
                                    placeholder="Senha do WiFi"
                                    placeholderTextColor={theme.colors.textTertiary}
                                    value={wifiPassword}
                                    onChangeText={setWifiPassword}
                                    secureTextEntry
                                    autoCapitalize="none"
                                />

                                <TouchableOpacity 
                                    style={[styles.sendButton, { backgroundColor: theme.colors.success }]} 
                                    onPress={sendWiFiCredentials}
                                >
                                    <Ionicons name="send" size={20} color={theme.colors.buttonText} />
                                    <Text style={[styles.sendButtonText, { color: theme.colors.buttonText }]}>
                                        Enviar Credenciais WiFi (cmd: 5)
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={[styles.sendButton, { backgroundColor: theme.colors.primary }]} 
                                    onPress={async () => {
                                        try {
                                            addLog('📤 Solicitando lista de WiFis (cmd: 4)...');
                                            await bleService.listWiFis();
                                            addLog('✅ Comando enviado! Aguardando resposta do ESP32...');
                                        } catch (error: any) {
                                            addLog(`❌ Erro: ${error?.message || 'Erro desconhecido'}`);
                                        }
                                    }}
                                >
                                    <Ionicons name="wifi" size={20} color={theme.colors.buttonText} />
                                    <Text style={[styles.sendButtonText, { color: theme.colors.buttonText }]}>
                                        Listar WiFis (cmd: 4)
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Logs */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                                Logs ({logs.length})
                            </Text>
                            <View style={[styles.logContainer, { backgroundColor: theme.colors.surface }]}>
                                {logs.length === 0 ? (
                                    <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>
                                        Nenhum log ainda
                                    </Text>
                                ) : (
                                    <FlatList
                                        data={logs}
                                        keyExtractor={(item, index) => `${index}-${item}`}
                                        renderItem={({ item }) => (
                                            <Text style={[styles.logText, { color: theme.colors.textSecondary }]}>
                                                {item}
                                            </Text>
                                        )}
                                        scrollEnabled={true}
                                        nestedScrollEnabled={true}
                                        style={{ maxHeight: 150 }}
                                    />
                                )}
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeScreen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        marginBottom: 24,
    },
    statusCard: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusLabel: {
        fontSize: 16,
    },
    statusValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    statusValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    buttonSecondary: {
        borderWidth: 1,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        marginBottom: 24,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    emptyCard: {
        padding: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 12,
    },
    deviceCard: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    deviceInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    deviceDetails: {
        flex: 1,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    deviceId: {
        fontSize: 12,
        marginBottom: 2,
    },
    deviceRssi: {
        fontSize: 12,
    },
    connectButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    connectButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 12,
    },
    sendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 8,
    },
    sendButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    logContainer: {
        borderRadius: 12,
        padding: 12,
        maxHeight: 150,
    },
    logText: {
        fontSize: 12,
        fontFamily: 'monospace',
        marginBottom: 4,
    },
});