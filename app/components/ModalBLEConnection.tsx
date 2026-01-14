import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
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
import { useTheme } from "../context/ThemeContext";
import ModalGlobal from "./ModalGlobal";

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

interface ModalBLEConnectionProps {
  visible: boolean;
  onClose: () => void;
}

export default function ModalBLEConnection({ visible, onClose }: ModalBLEConnectionProps) {
  const { theme } = useTheme();

  const [status, setStatus] = useState<ConnectionStatus>("desconectado");
  const [mensagem, setMensagem] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [dispositivos, setDispositivos] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [wifiSSID, setWifiSSID] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiStatus, setWifiStatus] = useState<"idle" | "enviando" | "aguardando" | "conectado" | "erro">("idle");
  const [wifiIP, setWifiIP] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const ssidInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const wifiSectionRef = useRef<View>(null);

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
      console.log("Dispositivo encontrado:", {
        id: scannedDevice.id,
        name: scannedDevice.name || "(sem nome)",
        rssi: scannedDevice.rssi,
        isConnectable: scannedDevice.isConnectable,
      });

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

  // Processar notificações do ESP32 relacionadas ao WiFi
  const processarNotificacaoWiFi = useCallback((mensagem: string) => {
    try {
      // Tentar fazer parse do JSON
      const response = JSON.parse(mensagem);
      
      console.log("📡 Notificação recebida:", response);
      
      // BTCOMMAND_SUCCESS (cmd: 2) - WiFi conectado com sucesso
      if (response.cmd === 2) {
        if (response.data && typeof response.data === 'string' && response.data.includes("WiFi OK")) {
          // Extrair IP da mensagem
          const ipMatch = response.data.match(/IP: ([\d.]+)/);
          const ipAddress = ipMatch ? ipMatch[1] : null;
          
          setWifiIP(ipAddress);
          setWifiStatus("conectado");
          
          registrarLog("esp32", `✅ WiFi conectado com sucesso!${ipAddress ? ` IP: ${ipAddress}` : ''}`);
          
          // Mostrar mensagem de sucesso na tela
          const mensagemSucesso = ipAddress 
            ? `WiFi conectado com sucesso!\n\nIP do ESP32: ${ipAddress}`
            : "WiFi conectado com sucesso!";
          
          Alert.alert(
            "✅ Sucesso!",
            mensagemSucesso,
            [
              {
                text: "OK",
                style: "default"
              }
            ],
            { cancelable: false }
          );
          
          // Limpar campos após sucesso (opcional)
          // setWifiSSID("");
          // setWifiPassword("");
        } else {
          // Outro tipo de sucesso
          registrarLog("esp32", `Sucesso: ${response.data}`);
        }
      }
      // BTCOMMAND_ERROR (cmd: 1) - Erro
      else if (response.cmd === 1) {
        const errorCode = response.data;
        
        if (errorCode === 4) {
          // BTERROR_WIFI_CONNECTION
          setWifiStatus("erro");
          registrarLog("esp32", "❌ Erro: Falha ao conectar ao WiFi");
        } else {
          setWifiStatus("erro");
          registrarLog("esp32", `❌ Erro recebido: ${errorCode}`);
        }
      }
      // BTCOMMAND_MESSAGE (cmd: 13) - Mensagem genérica
      else if (response.cmd === 5) {
        registrarLog("esp32", `Mensagem: ${response.data}`);
        
        // Se receber "Credenciais OK", significa que o ESP32 recebeu as credenciais
        // mas ainda está tentando conectar
        if (response.data && response.data.includes("Credenciais")) {
          setWifiStatus("aguardando");
          registrarLog("sistema", "Aguardando conexão WiFi (pode levar até 10 segundos)...");
        }
      }
      // BTCOMMAND_WIFI_LIST (cmd: 14) - Lista de redes WiFi
      else if (response.cmd === 4) {
        registrarLog("esp32", `Redes WiFi disponíveis: ${JSON.stringify(response.data)}`);
      }
    } catch (err) {
      // Se não for JSON válido, apenas logar como mensagem normal
      console.log("Mensagem não-JSON recebida:", mensagem);
    }
  }, [registrarLog]);

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

      // Habilitar notificações e monitorar características
      deviceWithServices.monitorCharacteristicForService(
        SERVICE_UUID,
        MESSAGE_UUID,
        (error, characteristic) => {
          if (error) {
            console.warn("Erro ao monitorar MESSAGE_UUID:", error);
            return;
          }
          if (characteristic?.value != null) {
            try {
              const decoded = base64.decode(characteristic.value);
              registrarLog("esp32", decoded);
              console.log("Message update received:", decoded);
              
              // Processar notificação JSON
              processarNotificacaoWiFi(decoded);
            } catch (err) {
              console.error("Erro ao processar notificação:", err);
            }
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
  }, [registrarLog, processarNotificacaoWiFi]);

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
    // Resetar status do WiFi ao desconectar
    setWifiStatus("idle");
    setWifiIP(null);
  }, [connectedDevice, registrarLog]);

  // Limpar conexões quando o modal fechar
  useEffect(() => {
    if (!visible) {
      desconectar();
    }
  }, [visible, desconectar]);

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

      // Listar todas as características disponíveis para debug
      console.log("Características disponíveis:");
      characteristics.forEach((char) => {
        console.log(`- UUID: ${char.uuid}, WritableWithResponse: ${char.isWritableWithResponse}, WritableWithoutResponse: ${char.isWritableWithoutResponse}`);
      });

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

    // Resetar status do WiFi
    setWifiStatus("enviando");
    setWifiIP(null);
    
    // Criar JSON com cmd: 15 (WIFI_AUTH), ssid e password
    const jsonData = JSON.stringify({
      cmd: 5,
      ssid: wifiSSID,
      password: wifiPassword,
    });

    const encodedValue = base64.encode(jsonData);

    console.log("Enviando JSON:", jsonData, "Encoded:", encodedValue);

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

      // Listar todas as características disponíveis para debug
      console.log("Características disponíveis:");
      characteristics.forEach((char) => {
        console.log(`- UUID: ${char.uuid}, WritableWithResponse: ${char.isWritableWithResponse}, WritableWithoutResponse: ${char.isWritableWithoutResponse}`);
      });

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
          registrarLog("app", `WiFi enviado: SSID=${wifiSSID} (cmd: 15)`);
          setWifiStatus("aguardando");
          registrarLog("sistema", "Aguardando confirmação de conexão WiFi (pode levar até 10 segundos)...");
          // IMPORTANTE: NÃO desconectar do BLE aqui! Manter conexão ativa para receber notificação
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
          setWifiStatus("aguardando");
          registrarLog("sistema", "Aguardando confirmação de conexão WiFi (pode levar até 10 segundos)...");
          // IMPORTANTE: NÃO desconectar do BLE aqui! Manter conexão ativa para receber notificação
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
    if (!visible) return;

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
  }, [visible, registrarLog]);

  return (
    <ModalGlobal
      visible={visible}
      onClose={onClose}
      title="Conexão BLE com ESP32"
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        style={{ flex: 1 }}
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

          <View ref={wifiSectionRef} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Configurar Wi-Fi no ESP32
            </Text>

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>SSID (Nome da rede)</Text>
            <TextInput
              ref={ssidInputRef}
              value={wifiSSID}
              onChangeText={setWifiSSID}
              placeholder="Digite o SSID da rede Wi-Fi"
              placeholderTextColor={theme.colors.textTertiary}
              autoCapitalize="none"
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 300);
              }}
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
              ref={passwordInputRef}
              value={wifiPassword}
              onChangeText={setWifiPassword}
              placeholder="Digite a senha do Wi-Fi"
              placeholderTextColor={theme.colors.textTertiary}
              secureTextEntry
              autoCapitalize="none"
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 300);
              }}
              style={[
                styles.input,
                {
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surface,
                },
              ]}
            />

            {/* Status do WiFi */}
            {wifiStatus !== "idle" && (
              <View
                style={[
                  styles.wifiStatusBox,
                  {
                    backgroundColor:
                      wifiStatus === "conectado"
                        ? theme.colors.success + "20"
                        : wifiStatus === "erro"
                          ? theme.colors.error + "20"
                          : theme.colors.warning + "20",
                    borderColor:
                      wifiStatus === "conectado"
                        ? theme.colors.success
                        : wifiStatus === "erro"
                          ? theme.colors.error
                          : theme.colors.warning,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.wifiStatusText,
                    {
                      color:
                        wifiStatus === "conectado"
                          ? theme.colors.success
                          : wifiStatus === "erro"
                            ? theme.colors.error
                            : theme.colors.warning,
                    },
                  ]}
                >
                  {wifiStatus === "enviando" && "📤 Enviando credenciais..."}
                  {wifiStatus === "aguardando" && "⏳ Aguardando conexão WiFi..."}
                  {wifiStatus === "conectado" && `✅ WiFi conectado!${wifiIP ? ` IP: ${wifiIP}` : ''}`}
                  {wifiStatus === "erro" && "❌ Erro ao conectar WiFi"}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor:
                    wifiStatus === "conectado"
                      ? theme.colors.success
                      : connectedDevice
                        ? theme.colors.buttonPrimary
                        : theme.colors.border,
                },
              ]}
              onPress={enviarCredenciaisWifi}
              disabled={!connectedDevice || wifiStatus === "enviando" || wifiStatus === "aguardando"}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color:
                      wifiStatus === "conectado" || connectedDevice
                        ? theme.colors.buttonText
                        : theme.colors.textSecondary,
                  },
                ]}
              >
                {wifiStatus === "enviando" && "Enviando..."}
                {wifiStatus === "aguardando" && "Aguardando..."}
                {wifiStatus === "conectado" && "WiFi Conectado ✓"}
                {wifiStatus === "erro" && "Tentar Novamente"}
                {wifiStatus === "idle" && "Enviar Wi-Fi"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
    </ModalGlobal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
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
  wifiStatusBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  wifiStatusText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});

