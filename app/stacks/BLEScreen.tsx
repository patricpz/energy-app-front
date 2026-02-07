import { useFocusEffect, useRouter } from "expo-router";
import { ArrowLeft } from "phosphor-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import base64 from "react-native-base64";
import { BleManager, Device } from "react-native-ble-plx";
import { NetworkInfo } from "react-native-network-info";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

type ConnectionStatus = "desconectado" | "escaneando" | "conectando" | "conectado" | "erro";

type LogEntry = {
  id: string;
  origem: "app" | "esp32" | "sistema";
  mensagem: string;
  horario: string;
};

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const MESSAGE_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const BOX_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a9";

const BLTManager = new BleManager();

export default function BLEScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [status, setStatus] = useState<ConnectionStatus>("desconectado");
  const [mensagem, setMensagem] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [dispositivos, setDispositivos] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isScanning, setIsScanning] = useState(false);
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

  // Limpar conexões quando a tela perder o foco
  useFocusEffect(
    useCallback(() => {
      return () => {
        // Cleanup quando a tela perder o foco
        if (connectedDevice) {
          BLTManager.cancelTransaction("messagetransaction");
          BLTManager.cancelTransaction("boxtransaction");
          BLTManager.cancelDeviceConnection(connectedDevice.id).catch(() => {
            // Ignorar erros de desconexão no cleanup
          });
        }
      };
    }, [connectedDevice])
  );

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
        return false;
      }

      return granted;
    } else {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Permission Localisation Bluetooth",
          message: "Requirement for Bluetooth",
          buttonNeutral: "Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        },
      );

      if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        registrarLog("sistema", "Permissão de localização é necessária para BLE.");
        return false;
      }
      return true;
    }
  }, [registrarLog]);

  // Scans available BLE Devices
  const scanDevices = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      registrarLog("sistema", "Permissões necessárias não foram concedidas");
      return;
    }

    setDispositivos([]);
    setIsScanning(true);
    setStatus("escaneando");
    registrarLog("sistema", "Escaneando dispositivos...");

    BLTManager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        registrarLog("sistema", `Erro ao escanear: ${error.message}`);
        setStatus("erro");
        setIsScanning(false);
        BLTManager.stopDeviceScan();
        return;
      }

      if (!scannedDevice) return;

      // Log do dispositivo encontrado


      // Adicionar à lista de dispositivos (evitar duplicatas)
      setDispositivos((prev) => {
        const existe = prev.some((d) => d.id === scannedDevice.id);
        if (existe) return prev;
        return [scannedDevice, ...prev];
      });

      // Tentar conectar automaticamente se encontrar dispositivo com nome específico
      if (scannedDevice.name === "BLEExample" || scannedDevice.name?.includes("ESP")) {
        registrarLog("sistema", "Dispositivo ESP encontrado, conectando...");
        BLTManager.stopDeviceScan();
        setIsScanning(false);
        connectDevice(scannedDevice);
      }
    });

    // stop scanning devices after 10 seconds
    setTimeout(() => {
      BLTManager.stopDeviceScan();
      setIsScanning(false);
      if (dispositivos.length === 0) {
        registrarLog("sistema", "Nenhum dispositivo encontrado. Tente novamente.");
        setStatus("desconectado");
      } else {
        registrarLog("sistema", `${dispositivos.length} dispositivo(s) encontrado(s). Toque para conectar.`);
        setStatus("desconectado");
      }
    }, 10000);
  }, [requestPermissions, registrarLog, dispositivos.length]);

  // Connect the device and start monitoring characteristics
  const connectDevice = useCallback(async (device: Device) => {
    const deviceName = device.name || device.id;
    registrarLog("sistema", `Conectando a ${deviceName}...`);
    setStatus("conectando");

    try {
      const connectedDevice = await device.connect();
      registrarLog("sistema", `Dispositivo conectado: ${deviceName}`);
      setConnectedDevice(connectedDevice);
      setStatus("conectado");

      // Descobrir serviços e características
      const deviceWithServices = await connectedDevice.discoverAllServicesAndCharacteristics();
      registrarLog("sistema", "Serviços e características descobertos");

      // Set what to do when DC is detected
      BLTManager.onDeviceDisconnected(deviceWithServices.id, (error, device) => {
        registrarLog("sistema", "Dispositivo desconectado");
        setStatus("desconectado");
        setConnectedDevice(null);
      });

      // Verificar se o serviço existe
      const services = await deviceWithServices.services();
      const targetService = services.find(
        (s) => s.uuid.toLowerCase() === SERVICE_UUID.toLowerCase()
      );

      if (!targetService) {
        registrarLog("sistema", `Service não encontrado: ${SERVICE_UUID}`);
        setStatus("erro");
        return;
      }

      registrarLog("sistema", `Service encontrado: ${SERVICE_UUID}`);

      // Monitor characteristics
      deviceWithServices.monitorCharacteristicForService(
        SERVICE_UUID,
        MESSAGE_UUID,
        (error, characteristic) => {
          if (error) {
            console.warn("Erro ao monitorar MESSAGE_UUID:", error);
            return;
          }
          if (characteristic?.value != null) {
            const decoded = base64.decode(characteristic.value);
            registrarLog("esp32", decoded);
          }
        },
        "messagetransaction",
      );

      registrarLog("sistema", `Conectado: ${deviceName} - Pronto para enviar`);
    } catch (error: any) {
      registrarLog("sistema", `Erro ao conectar: ${error?.message || String(error)}`);
      setStatus("erro");
      setConnectedDevice(null);
    }
  }, [registrarLog]);

  // Handle the device disconnection
  const desconectar = useCallback(async () => {
    registrarLog("sistema", "Desconectando...");

    if (connectedDevice != null) {
      const isDeviceConnected = await connectedDevice.isConnected();
      if (isDeviceConnected) {
        BLTManager.cancelTransaction("messagetransaction");
        BLTManager.cancelTransaction("boxtransaction");

        BLTManager.cancelDeviceConnection(connectedDevice.id).then(() => {
          registrarLog("sistema", "Desconexão concluída");
        });
      }

      const connectionStatus = await connectedDevice.isConnected();
      if (!connectionStatus) {
        setStatus("desconectado");
      }
    }

    setConnectedDevice(null);
    setStatus("desconectado");
  }, [connectedDevice, registrarLog]);

  const enviarMensagem = useCallback(async () => {
    if (!mensagem.trim()) {
      registrarLog("sistema", "Digite uma mensagem antes de enviar.");
      return;
    }

    if (!connectedDevice) {
      registrarLog("sistema", "Conecte-se ao ESP32 primeiro.");
      return;
    }

    // Verificar permissões antes de enviar (especialmente importante no Android 12+)
    if (Platform.OS === "android" && Platform.Version >= 31) {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        registrarLog("sistema", "Permissões necessárias não foram concedidas para enviar dados.");
        return;
      }
    }

    // Verificar se o dispositivo está realmente conectado
    try {
      const isConnected = await connectedDevice.isConnected();
      if (!isConnected) {
        registrarLog("sistema", "Dispositivo não está conectado.");
        setStatus("desconectado");
        return;
      }
    } catch (error) {
      registrarLog("sistema", `Erro ao verificar conexão: ${String(error)}`);
      setStatus("desconectado");
      return;
    }

    const encodedValue = base64.encode(mensagem);

    try {
      // Primeiro, tentar descobrir as características para verificar permissões
      const services = await connectedDevice.services();
      const targetService = services.find(
        (s) => s.uuid.toLowerCase() === SERVICE_UUID.toLowerCase()
      );

      if (!targetService) {
        registrarLog("sistema", `Service não encontrado: ${SERVICE_UUID}`);
        return;
      }

      const characteristics = await targetService.characteristics();

      // Tentar encontrar a característica MESSAGE_UUID primeiro
      let targetCharacteristic = characteristics.find(
        (c) => c.uuid.toLowerCase() === MESSAGE_UUID.toLowerCase()
      );

      // Se não encontrar MESSAGE_UUID, tentar usar BOX_UUID como alternativa
      if (!targetCharacteristic) {
        registrarLog("sistema", `Characteristic ${MESSAGE_UUID} não encontrada. Tentando usar ${BOX_UUID}...`);
        targetCharacteristic = characteristics.find(
          (c) => c.uuid.toLowerCase() === BOX_UUID.toLowerCase()
        );
      }

      // Se ainda não encontrou, usar a primeira característica que suporta escrita
      if (!targetCharacteristic) {
        registrarLog("sistema", "Nenhuma das características esperadas encontrada. Procurando qualquer característica que suporte escrita...");
        targetCharacteristic = characteristics.find(
          (c) => c.isWritableWithResponse || c.isWritableWithoutResponse
        );
      }

      if (!targetCharacteristic) {
        registrarLog("sistema", "Nenhuma característica com permissão de escrita encontrada!");
        return;
      }

      registrarLog("sistema", `Usando característica: ${targetCharacteristic.uuid}`);

      // Tentar primeiro com resposta (se suportado)
      if (targetCharacteristic.isWritableWithResponse) {
        try {
          await connectedDevice.writeCharacteristicWithResponseForService(
            SERVICE_UUID,
            targetCharacteristic.uuid,
            encodedValue,
          );
          registrarLog("app", mensagem);
          setMensagem("");
          return;
        } catch (errorWithResponse: any) {
          registrarLog("sistema", `Erro ao enviar com resposta, tentando sem resposta: ${errorWithResponse?.message || String(errorWithResponse)}`);
        }
      }

      // Se não suporta com resposta ou falhou, tentar sem resposta
      if (targetCharacteristic.isWritableWithoutResponse) {
        try {
          await connectedDevice.writeCharacteristicWithoutResponseForService(
            SERVICE_UUID,
            targetCharacteristic.uuid,
            encodedValue,
          );
          registrarLog("app", mensagem);
          setMensagem("");
          return;
        } catch (errorWithoutResponse: any) {
          registrarLog("sistema", `Erro ao enviar sem resposta: ${errorWithoutResponse?.message || String(errorWithoutResponse)}`);
          throw errorWithoutResponse;
        }
      }

      registrarLog("sistema", "Characteristic não suporta escrita!");
    } catch (error: any) {
      registrarLog("sistema", `Erro ao enviar: ${error?.message || String(error)}`);
      registrarLog("sistema", `Detalhes: reason=${error?.reason}, errorCode=${error?.errorCode}, attErrorCode=${error?.attErrorCode}`);

      // Tentar reconectar se houver erro
      try {
        const isStillConnected = await connectedDevice.isConnected();
        if (!isStillConnected) {
          setStatus("desconectado");
          registrarLog("sistema", "Dispositivo desconectado após erro");
        }
      } catch (checkError) {
        setStatus("desconectado");
        registrarLog("sistema", "Erro ao verificar conexão após erro");
      }
    }
  }, [connectedDevice, mensagem, registrarLog, requestPermissions]);

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

    // Verificar permissões antes de enviar (especialmente importante no Android 12+)
    if (Platform.OS === "android" && Platform.Version >= 31) {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        registrarLog("sistema", "Permissões necessárias não foram concedidas para enviar dados.");
        return;
      }
    }

    // Verificar se o dispositivo está realmente conectado
    try {
      const isConnected = await connectedDevice.isConnected();
      if (!isConnected) {
        registrarLog("sistema", "Dispositivo não está conectado.");
        setStatus("desconectado");
        return;
      }
    } catch (error) {
      registrarLog("sistema", `Erro ao verificar conexão: ${String(error)}`);
      setStatus("desconectado");
      return;
    }

    // Criar JSON com cmd: 5, ssid e password
    const jsonData = JSON.stringify({
      cmd: 5,
      ssid: wifiSSID,
      password: wifiPassword,
    });

    const encodedValue = base64.encode(jsonData);


    try {
      // Primeiro, tentar descobrir as características para verificar permissões
      const services = await connectedDevice.services();
      const targetService = services.find(
        (s) => s.uuid.toLowerCase() === SERVICE_UUID.toLowerCase()
      );

      if (!targetService) {
        registrarLog("sistema", `Service não encontrado: ${SERVICE_UUID}`);
        return;
      }

      const characteristics = await targetService.characteristics();



      // Tentar encontrar a característica BOX_UUID primeiro
      let targetCharacteristic = characteristics.find(
        (c) => c.uuid.toLowerCase() === BOX_UUID.toLowerCase()
      );

      // Se não encontrar BOX_UUID, tentar usar MESSAGE_UUID (TX) como alternativa
      if (!targetCharacteristic) {
        registrarLog("sistema", `Characteristic ${BOX_UUID} não encontrada. Tentando usar ${MESSAGE_UUID} (TX)...`);
        targetCharacteristic = characteristics.find(
          (c) => c.uuid.toLowerCase() === MESSAGE_UUID.toLowerCase()
        );
      }

      // Se ainda não encontrou, usar a primeira característica que suporta escrita
      if (!targetCharacteristic) {
        registrarLog("sistema", "Nenhuma das características esperadas encontrada. Procurando qualquer característica que suporte escrita...");
        targetCharacteristic = characteristics.find(
          (c) => c.isWritableWithResponse || c.isWritableWithoutResponse
        );
      }

      if (!targetCharacteristic) {
        registrarLog("sistema", "Nenhuma característica com permissão de escrita encontrada!");
        return;
      }

      registrarLog("sistema", `Usando característica: ${targetCharacteristic.uuid}`);

      // Tentar primeiro com resposta (se suportado)
      if (targetCharacteristic.isWritableWithResponse) {
        try {
          await connectedDevice.writeCharacteristicWithResponseForService(
            SERVICE_UUID,
            targetCharacteristic.uuid,
            encodedValue,
          );
          registrarLog("app", `WiFi enviado: SSID=${wifiSSID} (cmd: 5)`);
          return;
        } catch (errorWithResponse: any) {
          registrarLog("sistema", `Erro ao enviar com resposta, tentando sem resposta: ${errorWithResponse?.message || String(errorWithResponse)}`);
        }
      }

      // Se não suporta com resposta ou falhou, tentar sem resposta
      if (targetCharacteristic.isWritableWithoutResponse) {
        try {
          await connectedDevice.writeCharacteristicWithoutResponseForService(
            SERVICE_UUID,
            targetCharacteristic.uuid,
            encodedValue,
          );
          registrarLog("app", `WiFi enviado: SSID=${wifiSSID} (cmd: 5)`);
          return;
        } catch (errorWithoutResponse: any) {
          registrarLog("sistema", `Erro ao enviar sem resposta: ${errorWithoutResponse?.message || String(errorWithoutResponse)}`);
          throw errorWithoutResponse;
        }
      }

      registrarLog("sistema", "Characteristic não suporta escrita!");
    } catch (error: any) {
      registrarLog("sistema", `Erro ao enviar Wi-Fi: ${error?.message || String(error)}`);
      registrarLog("sistema", `Detalhes: reason=${error?.reason}, errorCode=${error?.errorCode}, attErrorCode=${error?.attErrorCode}`);

      // Tentar reconectar se houver erro
      try {
        const isStillConnected = await connectedDevice.isConnected();
        if (!isStillConnected) {
          setStatus("desconectado");
          registrarLog("sistema", "Dispositivo desconectado após erro");
        }
      } catch (checkError) {
        setStatus("desconectado");
        registrarLog("sistema", "Erro ao verificar conexão após erro");
      }
    }
  }, [wifiSSID, wifiPassword, connectedDevice, registrarLog, requestPermissions]);

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
  }, [registrarLog]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: theme.colors.header }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} weight="regular" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Configuração BLE</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { paddingHorizontal: 20, paddingTop: 20 }]}
          showsVerticalScrollIndicator={true}
        >
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Faça o pareamento inicial via Bluetooth Low Energy, acompanhe o status e envie comandos.
          </Text>

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
                    isScanning ? theme.colors.warning : theme.colors.buttonPrimary,
                },
              ]}
              onPress={isScanning ? () => {
                BLTManager.stopDeviceScan();
                setIsScanning(false);
                setStatus("desconectado");
                registrarLog("sistema", "Varredura interrompida.");
              } : scanDevices}
            >
              <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
                {isScanning ? "Parar varredura" : "Escanear BLE"}
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
                    onPress={() => {
                      BLTManager.stopDeviceScan();
                      setIsScanning(false);
                      connectDevice(device);
                    }}
                  >
                    <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
                      {connectedDevice?.id === device.id
                        ? "Conectado"
                        : status === "conectando"
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

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>SSID (Nome da rede)</Text>
            <TextInput
              value={wifiSSID}
              onChangeText={setWifiSSID}
              placeholder="Digite o SSID da rede Wi-Fi"
              placeholderTextColor={theme.colors.textTertiary}
              autoCapitalize="none"
              style={[
                styles.input,
                {
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surface,
                },
              ]}
            />

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Senha</Text>
            <TextInput
              value={wifiPassword}
              onChangeText={setWifiPassword}
              placeholder="Digite a senha do Wi-Fi"
              placeholderTextColor={theme.colors.textTertiary}
              secureTextEntry
              autoCapitalize="none"
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  container: {
    paddingBottom: 20,
    gap: 20,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 8,
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
    fontSize: 15,
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
    minHeight: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: "top",
    fontSize: 14,
  },
  logTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  logList: {
    paddingBottom: 20,
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

