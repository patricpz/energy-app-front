import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BleManager, Device, Subscription } from "react-native-ble-plx";
import { NetworkInfo } from "react-native-network-info";
import { useTheme } from "../context/ThemeContext";
import SafeScreen from "../SafeScreen";


type ConnectionStatus = "desconectado" | "escaneando" | "conectando" | "conectado" | "erro";

type LogEntry = {
  id: string;
  origem: "app" | "esp32" | "sistema";
  mensagem: string;
  horario: string;
};

const DEFAULT_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const DEFAULT_TX_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const DEFAULT_RX_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a9";

const encodeUtf8ToBase64 = (valor: string) => {
  try {
    if (typeof globalThis.btoa === "function") {
      return globalThis.btoa(unescape(encodeURIComponent(valor)));
    }
  } catch {
    return "";
  }
  return "";
};

const decodeBase64ToUtf8 = (valor: string) => {
  try {
    if (typeof globalThis.atob === "function") {
      return decodeURIComponent(escape(globalThis.atob(valor)));
    }
  } catch {
    return "";
  }
  return "";
};

export default function Booking() {
  const { theme } = useTheme();
  const managerRef = useRef(new BleManager());
  const notificationRef = useRef<Subscription | null>(null);

  const [status, setStatus] = useState<ConnectionStatus>("desconectado");
  const [mensagem, setMensagem] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [dispositivos, setDispositivos] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [conectandoId, setConectandoId] = useState<string | null>(null);
  const [serviceUuid, setServiceUuid] = useState(DEFAULT_SERVICE_UUID);
  const [txCharacteristicUuid, setTxCharacteristicUuid] = useState(DEFAULT_TX_UUID);
  const [rxCharacteristicUuid, setRxCharacteristicUuid] = useState(DEFAULT_RX_UUID);
  const [wifiSSID, setWifiSSID] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");


  const statusColor = useMemo(() => {
    switch (status) {
      case "conectado":
        return theme.colors.success;
      case "conectando":
      case "escaneando":
        return theme.colors.warning;
      case "erro":
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  }, [status, theme.colors]);

  useEffect(() => {
    return () => {
      notificationRef.current?.remove();
      managerRef.current.destroy();
    };
  }, []);

  const registrarLog = useCallback((origem: LogEntry["origem"], mensagem: string) => {
    setLog((prev) => [
      {
        id: String(Date.now() + Math.random()),
        origem,
        mensagem,
        horario: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
  }, []);

  const requestPermissions = useCallback(async () => {
    if (Platform.OS !== "android") {
      return true;
    }

    if (Platform.Version >= 31) {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      const granted = Object.values(result).every(
        (value) => value === PermissionsAndroid.RESULTS.GRANTED,
      );

      if (!granted) {
        registrarLog("sistema", "Permissões de Bluetooth negadas.");
      }

      return granted;
    } else {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        registrarLog("sistema", "Permissão de localização é necessária para BLE.");
        return false;
      }
      return true;
    }
  }, [registrarLog]);

  const resetDispositivos = useCallback(() => {
    setDispositivos([]);
  }, []);

  const iniciarScan = useCallback(async () => {
    if (!(await requestPermissions())) {
      return;
    }

    resetDispositivos();
    setStatus("escaneando");
    registrarLog("sistema", "Iniciando varredura por dispositivos BLE...");

    managerRef.current.startDeviceScan(null, null, (error, device) => {
      if (error) {
        registrarLog("sistema", `Erro ao escanear: ${error.message}`);
        setStatus("erro");
        managerRef.current.stopDeviceScan();
        return;
      }

      if (!device) return;

      setDispositivos((prev) => {
        const existe = prev.some((d) => d.id === device.id);
        if (existe) return prev;
        return [device, ...prev];
      });
    });
  }, [requestPermissions, resetDispositivos, registrarLog]);

  const pararScan = useCallback(
    (motivo?: string) => {
      managerRef.current.stopDeviceScan();
      if (status === "escaneando") {
        setStatus("desconectado");
      }
      if (motivo) {
        registrarLog("sistema", motivo);
      }
    },
    [registrarLog, status],
  );

  const limparNotificacoes = useCallback(() => {
    notificationRef.current?.remove();
    notificationRef.current = null;
  }, []);

  const monitorarNotificacoes = useCallback(
    (device: Device) => {
      if (!serviceUuid.trim() || !rxCharacteristicUuid.trim()) {
        registrarLog("sistema", "Configure os UUIDs antes de ativar notificações.");
        return;
      }

      limparNotificacoes();

      notificationRef.current = device.monitorCharacteristicForService(
        serviceUuid.trim(),
        rxCharacteristicUuid.trim(),
        (error, characteristic) => {
          if (error) {
            registrarLog("sistema", `Erro nas notificações: ${error.message}`);
            return;
          }

          if (!characteristic?.value) {
            registrarLog("esp32", "(mensagem vazia)");
            return;
          }

          const texto = decodeBase64ToUtf8(characteristic.value);
          registrarLog("esp32", texto || "(dados recebidos)");
        },
      );
    },
    [limparNotificacoes, registrarLog, rxCharacteristicUuid, serviceUuid],
  );

  const conectarAoDispositivo = useCallback(
    async (deviceId: string) => {
      setConectandoId(deviceId);
      setStatus("conectando");
      registrarLog("sistema", "Tentando conectar ao dispositivo selecionado...");
      managerRef.current.stopDeviceScan();

      try {
        const device = await managerRef.current.connectToDevice(deviceId, { timeout: 10000 });
        const pronto = await device.discoverAllServicesAndCharacteristics();
        setConnectedDevice(pronto);
        setStatus("conectado");
        registrarLog(
          "sistema",
          `Conectado a ${pronto.name ?? "dispositivo sem nome"} (${pronto.id}).`,
        );

        monitorarNotificacoes(pronto);
      } catch (error) {
        setStatus("erro");
        setConnectedDevice(null);
        registrarLog("sistema", `Falha ao conectar: ${String(error)}`);
      } finally {
        setConectandoId(null);
      }
    },
    [monitorarNotificacoes, registrarLog],
  );

  const desconectar = useCallback(async () => {
    limparNotificacoes();

    if (connectedDevice) {
      try {
        await managerRef.current.cancelDeviceConnection(connectedDevice.id);
        registrarLog("sistema", "Conexão encerrada.");
      } catch (error) {
        registrarLog("sistema", `Falha ao desconectar: ${String(error)}`);
      }
    }

    setConnectedDevice(null);
    setStatus("desconectado");
  }, [connectedDevice, limparNotificacoes, registrarLog]);

  const enviarMensagem = useCallback(async () => {
    if (!mensagem.trim()) {
      registrarLog("sistema", "Digite uma mensagem antes de enviar.");
      return;
    }

    if (!connectedDevice) {
      registrarLog("sistema", "Conecte-se ao ESP32 primeiro.");
      return;
    }

    if (!serviceUuid.trim() || !txCharacteristicUuid.trim()) {
      registrarLog("sistema", "Informe o Service UUID e a characteristic de escrita.");
      return;
    }

    const payload = encodeUtf8ToBase64(mensagem);

    if (!payload) {
      registrarLog("sistema", "Não foi possível converter a mensagem para base64.");
      return;
    }

    try {
      await connectedDevice.writeCharacteristicWithResponseForService(
        serviceUuid.trim(),
        txCharacteristicUuid.trim(),
        payload,
      );
      registrarLog("app", mensagem);
      setMensagem("");
    } catch (error) {
      registrarLog("sistema", `Erro ao enviar: ${String(error)}`);
    }
  }, [
    connectedDevice,
    mensagem,
    registrarLog,
    serviceUuid,
    txCharacteristicUuid,
  ]);

  const renderLog = ({ item }: { item: LogEntry }) => {
    const cor =
      item.origem === "esp32"
        ? theme.colors.primary
        : item.origem === "app"
          ? theme.colors.text
          : theme.colors.textSecondary;

    return (
      <View style={[styles.logCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.logHeader, { color: cor }]}>
          {item.origem.toUpperCase()} · {item.horario}
        </Text>
        <Text style={[styles.logBody, { color: theme.colors.text }]}>{item.mensagem}</Text>
      </View>
    );
  };

  const enviarCredenciaisWifi = useCallback(async () => {
    if (!wifiSSID.trim()) {
      registrarLog("sistema", "SSID não detectado automaticamente.");
      return;
    }

    if (!wifiPassword.trim()) {
      registrarLog("sistema", "Digite a senha da rede.");
      return;
    }

    if (!connectedDevice) {
      registrarLog("sistema", "Conecte-se ao ESP32 primeiro.");
      return;
    }

    const json = JSON.stringify({
      ssid: wifiSSID,           // SSID obtido automaticamente
      password: wifiPassword,   // usuário digita apenas a senha
    });

    const payload = encodeUtf8ToBase64(json);

    try {
      await connectedDevice.writeCharacteristicWithResponseForService(
        serviceUuid.trim(),
        txCharacteristicUuid.trim(),
        payload
      );

      registrarLog("app", `WiFi enviado automaticamente: SSID=${wifiSSID}`);
    } catch (error) {
      registrarLog("sistema", `Erro ao enviar Wi-Fi: ${String(error)}`);
    }
}, [
  wifiSSID,
  wifiPassword,
  connectedDevice,
  registrarLog,
  serviceUuid,
  txCharacteristicUuid,
]);


useEffect(() => {
  const solicitarPermissao = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        registrarLog("sistema", "Permissão de localização negada. Não foi possível obter o SSID automaticamente.");
        return;
      }
    }

    NetworkInfo.getSSID().then((ssid) => {
      if (ssid && ssid !== "<unknown ssid>") {
        setWifiSSID(ssid);
        registrarLog("sistema", `SSID detectado automaticamente: ${ssid}`);
      } else {
        registrarLog("sistema", "Não foi possível obter o SSID automaticamente.");
      }
    });
  };

  solicitarPermissao();
}, []);
  


  return (
    <SafeScreen>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Conexão BLE com ESP32</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Faça o pareamento inicial via Bluetooth Low Energy, acompanhe o status e envie comandos.
          </Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>UUIDs do serviço</Text>

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Service UUID</Text>
            <TextInput
              value={serviceUuid}
              onChangeText={setServiceUuid}
              autoCapitalize="none"
              placeholder="ex: 4fafc201-1fb5-459e-8fcc-c5c9c331914b"
              placeholderTextColor={theme.colors.textTertiary}
              style={[
                styles.input,
                {
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surface,
                },
              ]}
            />

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Characteristic TX (escrita)</Text>
            <TextInput
              value={txCharacteristicUuid}
              onChangeText={setTxCharacteristicUuid}
              autoCapitalize="none"
              placeholder="UUID usado para enviar comandos"
              placeholderTextColor={theme.colors.textTertiary}
              style={[
                styles.input,
                {
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surface,
                },
              ]}
            />

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Characteristic RX (notificações)</Text>
            <TextInput
              value={rxCharacteristicUuid}
              onChangeText={setRxCharacteristicUuid}
              autoCapitalize="none"
              placeholder="UUID usado para receber mensagens"
              placeholderTextColor={theme.colors.textTertiary}
              style={[
                styles.input,
                {
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surface,
                },
              ]}
            />
          </View>

          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>Status:</Text>
            <Text style={[styles.statusValue, { color: statusColor }]}>{status.toUpperCase()}</Text>
          </View>

          {connectedDevice && (
            <View
              style={[
                styles.connectedBox,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.connectedText, { color: theme.colors.text }]}>
                {connectedDevice.name ?? "Dispositivo sem nome"}
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                ID: {connectedDevice.id}
              </Text>
            </View>
          )}

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor:
                    status === "escaneando" ? theme.colors.warning : theme.colors.buttonPrimary,
                },
              ]}
              onPress={status === "escaneando" ? () => pararScan("Varredura interrompida.") : iniciarScan}
            >
              <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
                {status === "escaneando" ? "Parar varredura" : "Escanear BLE"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.secondaryButton,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}
              onPress={desconectar}
              disabled={!connectedDevice}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: connectedDevice ? theme.colors.text : theme.colors.textSecondary },
                ]}
              >
                Desconectar
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Dispositivos encontrados
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                {dispositivos.length} dispositivo(s)
              </Text>
            </View>

            {dispositivos.length === 0 ? (
              <Text style={{ color: theme.colors.textTertiary }}>
                Toque em Escanear BLE para procurar o ESP32 em modo BLE.
              </Text>
            ) : (
              dispositivos.map((device) => (
                <View
                  key={device.id}
                  style={[
                    styles.deviceCard,
                    { borderColor: theme.colors.border, backgroundColor: theme.colors.card },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.deviceName, { color: theme.colors.text }]}>
                      {device.name ?? "Sem nome"}
                    </Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                      {device.id}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.connectButton,
                      {
                        backgroundColor:
                          connectedDevice?.id === device.id
                            ? theme.colors.success
                            : theme.colors.buttonPrimary,
                      },
                    ]}
                    disabled={!!connectedDevice && connectedDevice.id !== device.id}
                    onPress={() => conectarAoDispositivo(device.id)}
                  >
                    <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
                      {connectedDevice?.id === device.id
                        ? "Conectado"
                        : conectandoId === device.id
                          ? "Conectando..."
                          : "Conectar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Configurar Wi-Fi no ESP32
            </Text>

            <TextInput
              value={wifiPassword}
              onChangeText={setWifiPassword}
              placeholder="Senha do Wi-Fi"
              placeholderTextColor={theme.colors.textTertiary}
              secureTextEntry
              style={[
                styles.input,
                {
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surface,
                },
              ]}
            />

            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: connectedDevice
                    ? theme.colors.success
                    : theme.colors.border,
                },
              ]}
              onPress={enviarCredenciaisWifi}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: connectedDevice
                      ? theme.colors.buttonText
                      : theme.colors.textSecondary,
                  },
                ]}
              >
                Enviar Wi-Fi
              </Text>
            </TouchableOpacity>
          </View>


          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Mensagem para o ESP32
            </Text>
            <TextInput
              value={mensagem}
              onChangeText={setMensagem}
              placeholder='Ex: {"led": true}'
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              style={[
                styles.messageInput,
                {
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surface,
                },
              ]}
            />
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: connectedDevice ? theme.colors.success : theme.colors.border,
                },
              ]}
              onPress={enviarMensagem}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: connectedDevice ? theme.colors.buttonText : theme.colors.textSecondary },
                ]}
              >
                Enviar
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.logTitle, { color: theme.colors.textSecondary }]}>Histórico</Text>
          <FlatList
            data={log}
            keyExtractor={(item) => item.id}
            renderItem={renderLog}
            contentContainerStyle={styles.logList}
            ListEmptyComponent={
              <Text style={{ color: theme.colors.textTertiary }}>Nenhuma mensagem ainda.</Text>
            }
            scrollEnabled={false}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 48,
    gap: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  connectedBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  connectedText: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  deviceCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: "600",
  },
  connectButton: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  messageInput: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: "top",
  },
  logTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  logList: {
    paddingBottom: 40,
    gap: 12,
  },
  logCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  logHeader: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "600",
  },
  logBody: {
    fontSize: 14,
  },
});

