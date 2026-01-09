import React, { useState } from 'react';
import {
    Button,
    PermissionsAndroid,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import base64 from 'react-native-base64';

import { LogBox } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications

const BLTManager = new BleManager();

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';

const MESSAGE_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
const BOX_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a9';

function StringToBool(input: string) {
    if (input == '1') {
        return true;
    } else {
        return false;
    }
}

function BoolToString(input: boolean) {
    if (input == true) {
        return '1';
    } else {
        return '0';
    }
}

export default function App() {
    //Is a device connected?
    const [isConnected, setIsConnected] = useState(false);

    //What device is connected?
    const [connectedDevice, setConnectedDevice] = useState<Device>();

    const [message, setMessage] = useState('Nothing Yet');
    const [boxvalue, setBoxValue] = useState(false);
    const [wifiSSID, setWifiSSID] = useState('');
    const [wifiPassword, setWifiPassword] = useState('');
    const [dispositivos, setDispositivos] = useState<Device[]>([]);
    const [isScanning, setIsScanning] = useState(false);

    // Request Android permissions (including Android 12+)
    async function requestPermissions() {
        if (Platform.OS !== 'android') {
            return true;
        }

        if (Platform.Version >= 31) {
            // Android 12+ (API 31+) requires additional permissions
            const result = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]);

            const granted = Object.values(result).every(
                (value) => value === PermissionsAndroid.RESULTS.GRANTED,
            );

            if (!granted) {
                console.warn('Permissões de Bluetooth negadas');
                return false;
            }

            return granted;
        } else {
            // Android 11 and below
            const result = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Permission Localisation Bluetooth',
                    message: 'Requirement for Bluetooth',
                    buttonNeutral: 'Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );

            return result === PermissionsAndroid.RESULTS.GRANTED;
        }
    }

    // Scans availbale BLT Devices and then call connectDevice
    async function scanDevices() {
        const hasPermission = await requestPermissions();
        if (!hasPermission) {
            console.warn('Permissões necessárias não foram concedidas');
            setMessage('Permissões negadas');
            return;
        }

        setDispositivos([]);
        setIsScanning(true);
        setMessage('Escaneando dispositivos...');
        console.log('Iniciando scan de dispositivos BLE...');

        BLTManager.startDeviceScan(null, null, (error, scannedDevice) => {
            if (error) {
                console.warn('Erro ao escanear:', error);
                setMessage(`Erro: ${error.message}`);
                setIsScanning(false);
                BLTManager.stopDeviceScan();
                return;
            }

            if (!scannedDevice) return;

            // Log do dispositivo encontrado
            console.log('Dispositivo encontrado:', {
                id: scannedDevice.id,
                name: scannedDevice.name || '(sem nome)',
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
            // ou se encontrar pelo UUID do serviço
            if (scannedDevice.name === 'BLEExample' || scannedDevice.name?.includes('ESP')) {
                console.log('Dispositivo ESP encontrado, conectando...');
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
                setMessage('Nenhum dispositivo encontrado. Tente novamente.');
            } else {
                setMessage(`${dispositivos.length} dispositivo(s) encontrado(s). Toque para conectar.`);
            }
            console.log('Scan finalizado. Dispositivos encontrados:', dispositivos.length);
        }, 10000);
    }

    // handle the device disconnection (poorly)
    async function disconnectDevice() {
        console.log('Disconnecting start');

        if (connectedDevice != null) {
            const isDeviceConnected = await connectedDevice.isConnected();
            if (isDeviceConnected) {
                BLTManager.cancelTransaction('messagetransaction');
                BLTManager.cancelTransaction('nightmodetransaction');

                BLTManager.cancelDeviceConnection(connectedDevice.id).then(() =>
                    console.log('DC completed'),
                );
            }

            const connectionStatus = await connectedDevice.isConnected();
            if (!connectionStatus) {
                setIsConnected(false);
            }
        }
    }

    //Function to send data to ESP32
    async function sendBoxValue(value: boolean) {
        if (!connectedDevice) {
            console.warn('No device connected');
            return;
        }

        // Verificar permissões antes de enviar (especialmente importante no Android 12+)
        if (Platform.OS === 'android' && Platform.Version >= 31) {
            const hasPermission = await requestPermissions();
            if (!hasPermission) {
                console.warn('Permissões necessárias não foram concedidas para enviar dados');
                return;
            }
        }

        // Verificar se o dispositivo está realmente conectado
        try {
            const isConnected = await connectedDevice.isConnected();
            if (!isConnected) {
                console.warn('Device is not connected');
                setIsConnected(false);
                return;
            }
        } catch (error) {
            console.warn('Error checking connection:', error);
            setIsConnected(false);
            return;
        }

        // Criar JSON com cmd: 5, ssid e password
        const jsonData = JSON.stringify({
            cmd: 5,
            ssid: wifiSSID || '',
            password: wifiPassword || '',
        });

        const encodedValue = base64.encode(jsonData);

        console.log('Enviando JSON:', jsonData, 'Encoded:', encodedValue);

        try {
            // Primeiro, tentar descobrir as características para verificar permissões
            const services = await connectedDevice.services();
            const targetService = services.find(s => s.uuid.toLowerCase() === SERVICE_UUID.toLowerCase());

            if (!targetService) {
                console.error('Service não encontrado:', SERVICE_UUID);
                return;
            }

            const characteristics = await targetService.characteristics();
            
            // Listar todas as características disponíveis para debug
            console.log('Características disponíveis:');
            characteristics.forEach((char) => {
                console.log(`- UUID: ${char.uuid}, WritableWithResponse: ${char.isWritableWithResponse}, WritableWithoutResponse: ${char.isWritableWithoutResponse}`);
            });

            // Tentar encontrar a característica BOX_UUID primeiro
            let targetCharacteristic = characteristics.find(
                c => c.uuid.toLowerCase() === BOX_UUID.toLowerCase()
            );

            // Se não encontrar BOX_UUID, tentar usar MESSAGE_UUID (TX) como alternativa
            if (!targetCharacteristic) {
                console.warn(`Characteristic ${BOX_UUID} não encontrada. Tentando usar ${MESSAGE_UUID} (TX)...`);
                targetCharacteristic = characteristics.find(
                    c => c.uuid.toLowerCase() === MESSAGE_UUID.toLowerCase()
                );
            }

            // Se ainda não encontrou, usar a primeira característica que suporta escrita
            if (!targetCharacteristic) {
                console.warn('Nenhuma das características esperadas encontrada. Procurando qualquer característica que suporte escrita...');
                targetCharacteristic = characteristics.find(
                    c => c.isWritableWithResponse || c.isWritableWithoutResponse
                );
            }

            if (!targetCharacteristic) {
                console.error('Nenhuma característica com permissão de escrita encontrada!');
                console.error('Características disponíveis:', characteristics.map(c => c.uuid));
                return;
            }

            console.log(`Usando característica: ${targetCharacteristic.uuid}`);

            console.log('Characteristic encontrada. Propriedades:', {
                isWritableWithResponse: targetCharacteristic.isWritableWithResponse,
                isWritableWithoutResponse: targetCharacteristic.isWritableWithoutResponse,
            });

            // Tentar primeiro com resposta (se suportado)
            if (targetCharacteristic.isWritableWithResponse) {
                try {
                    const characteristic = await connectedDevice.writeCharacteristicWithResponseForService(
                        SERVICE_UUID,
                        targetCharacteristic.uuid,
                        encodedValue,
                    );

                    console.log('Valor enviado com sucesso (with response)!');
                    if (characteristic.value) {
                        console.log('Boxvalue changed to:', base64.decode(characteristic.value));
                    }
                    return;
                } catch (errorWithResponse: any) {
                    console.warn('Erro ao enviar com resposta, tentando sem resposta:', errorWithResponse?.message || errorWithResponse);
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
                    console.log('Valor enviado com sucesso (without response)!');
                    return;
                } catch (errorWithoutResponse: any) {
                    console.error('Erro ao enviar sem resposta:', errorWithoutResponse?.message || errorWithoutResponse);
                    throw errorWithoutResponse;
                }
            }

            console.error('Characteristic não suporta escrita!');
        } catch (error: any) {
            console.error('Erro ao enviar valor para ESP32:', error?.message || error);
            console.error('Detalhes do erro:', {
                reason: error?.reason,
                errorCode: error?.errorCode,
                attErrorCode: error?.attErrorCode,
            });

            // Tentar reconectar se houver erro
            try {
                const isStillConnected = await connectedDevice.isConnected();
                if (!isStillConnected) {
                    setIsConnected(false);
                    console.warn('Dispositivo desconectado após erro');
                }
            } catch (checkError) {
                setIsConnected(false);
                console.warn('Erro ao verificar conexão:', checkError);
            }
        }
    }
    //Connect the device and start monitoring characteristics
    async function connectDevice(device: Device) {
        const deviceName = device.name || device.id;
        console.log('Conectando ao dispositivo:', deviceName);
        setMessage(`Conectando a ${deviceName}...`);

        try {
            const connectedDevice = await device.connect();
            console.log('Dispositivo conectado:', deviceName);
            setConnectedDevice(connectedDevice);
            setIsConnected(true);
            setMessage(`Conectado: ${deviceName}`);

            // Descobrir serviços e características
            const deviceWithServices = await connectedDevice.discoverAllServicesAndCharacteristics();
            console.log('Serviços e características descobertos');

            //  Set what to do when DC is detected
            BLTManager.onDeviceDisconnected(deviceWithServices.id, (error, device) => {
                console.log('Dispositivo desconectado');
                setMessage('Dispositivo desconectado');
                setIsConnected(false);
                setConnectedDevice(undefined);
            });

            // Verificar se o serviço existe
            const services = await deviceWithServices.services();
            const targetService = services.find(
                (s) => s.uuid.toLowerCase() === SERVICE_UUID.toLowerCase()
            );

            if (!targetService) {
                console.warn('Service não encontrado:', SERVICE_UUID);
                setMessage(`Conectado, mas service ${SERVICE_UUID} não encontrado`);
                return;
            }

            console.log('Service encontrado:', SERVICE_UUID);

            //Read inital values
            try {
                //Message
                const messageChar = await deviceWithServices.readCharacteristicForService(
                    SERVICE_UUID,
                    MESSAGE_UUID
                );
                if (messageChar?.value) {
                    setMessage(base64.decode(messageChar.value));
                }
            } catch (error) {
                console.warn('Erro ao ler MESSAGE_UUID:', error);
            }

            try {
                //BoxValue
                const boxChar = await deviceWithServices.readCharacteristicForService(
                    SERVICE_UUID,
                    BOX_UUID
                );
                if (boxChar?.value) {
                    setBoxValue(StringToBool(base64.decode(boxChar.value)));
                }
            } catch (error) {
                console.warn('Erro ao ler BOX_UUID:', error);
            }

            //monitor values and tell what to do when receiving an update

            //Message
            deviceWithServices.monitorCharacteristicForService(
                SERVICE_UUID,
                MESSAGE_UUID,
                (error, characteristic) => {
                    if (error) {
                        console.warn('Erro ao monitorar MESSAGE_UUID:', error);
                        return;
                    }
                    if (characteristic?.value != null) {
                        setMessage(base64.decode(characteristic?.value));
                        console.log(
                            'Message update received: ',
                            base64.decode(characteristic?.value),
                        );
                    }
                },
                'messagetransaction',
            );

            //BoxValue
            deviceWithServices.monitorCharacteristicForService(
                SERVICE_UUID,
                BOX_UUID,
                (error, characteristic) => {
                    if (error) {
                        console.warn('Erro ao monitorar BOX_UUID:', error);
                        return;
                    }
                    if (characteristic?.value != null) {
                        setBoxValue(StringToBool(base64.decode(characteristic?.value)));
                        console.log(
                            'Box Value update received: ',
                            base64.decode(characteristic?.value),
                        );
                    }
                },
                'boxtransaction',
            );

            console.log('Conexão estabelecida com sucesso');
            setMessage(`Conectado: ${deviceName} - Pronto para enviar`);
        } catch (error: any) {
            console.error('Erro ao conectar:', error);
            setMessage(`Erro ao conectar: ${error?.message || String(error)}`);
            setIsConnected(false);
            setConnectedDevice(undefined);
        }
    }

    return (
        <ScrollView>
            <View>
                <View style={{ paddingBottom: 200 }}></View>

                {/* Title */}
                <View style={styles.rowView}>
                    <Text style={styles.titleText}>BLE Example</Text>
                </View>

                <View style={{ paddingBottom: 20 }}></View>

                {/* Connect Button */}
                <View style={styles.rowView}>
                    <TouchableOpacity style={{ width: 120 }}>
                        {!isConnected ? (
                            <Button
                                title="Connect"
                                onPress={() => {
                                    scanDevices();
                                }}
                                disabled={false}
                            />
                        ) : (
                            <Button
                                title="Disonnect"
                                onPress={() => {
                                    disconnectDevice();
                                }}
                                disabled={false}
                            />
                        )}
                    </TouchableOpacity>
                </View>

                <View style={{ paddingBottom: 20 }}></View>

                {/* Monitored Value */}
                <View style={styles.rowView}>
                    <Text style={styles.baseText}>{message}</Text>
                </View>

                <View style={{ paddingBottom: 10 }}></View>

                {/* Lista de Dispositivos Encontrados */}
                {dispositivos.length > 0 && (
                    <View style={styles.devicesContainer}>
                        <Text style={styles.devicesTitle}>Dispositivos encontrados:</Text>
                        {dispositivos.map((device) => (
                            <TouchableOpacity
                                key={device.id}
                                style={styles.deviceItem}
                                onPress={() => {
                                    BLTManager.stopDeviceScan();
                                    setIsScanning(false);
                                    connectDevice(device);
                                }}
                            >
                                <Text style={styles.deviceName}>
                                    {device.name || '(sem nome)'}
                                </Text>
                                <Text style={styles.deviceId}>ID: {device.id}</Text>
                                <Text style={styles.deviceRssi}>RSSI: {device.rssi}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {isScanning && (
                    <View style={styles.rowView}>
                        <Text style={styles.scanningText}>Escaneando...</Text>
                    </View>
                )}

                <View style={{ paddingBottom: 20 }}></View>

                {/* WiFi SSID Input */}
                <View style={styles.rowView}>
                    <Text style={styles.labelText}>SSID:</Text>
                    <TextInput
                        style={styles.input}
                        value={wifiSSID}
                        onChangeText={setWifiSSID}
                        placeholder="Digite o SSID"
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={{ paddingBottom: 10 }}></View>

                {/* WiFi Password Input */}
                <View style={styles.rowView}>
                    <Text style={styles.labelText}>Password:</Text>
                    <TextInput
                        style={styles.input}
                        value={wifiPassword}
                        onChangeText={setWifiPassword}
                        placeholder="Digite a senha"
                        placeholderTextColor="#999"
                        secureTextEntry
                    />
                </View>

                <View style={{ paddingBottom: 20 }}></View>

                {/* Switch */}
                <View style={styles.rowView}>
                    <Text style={styles.labelText}>Enviar WiFi:</Text>
                    <Switch
                        disabled={false}
                        value={boxvalue}
                        onValueChange={(newValue: boolean) => {
                            setBoxValue(newValue);
                            sendBoxValue(newValue);
                        }}
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    rowView: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    titleText: {
        fontSize: 24,
        fontWeight: '600',
    },
    baseText: {
        fontSize: 16,
    },
    labelText: {
        fontSize: 16,
        marginRight: 10,
        minWidth: 80,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    devicesContainer: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    devicesTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    deviceItem: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 15,
        marginBottom: 10,
        backgroundColor: '#f5f5f5',
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
    },
    deviceId: {
        fontSize: 12,
        color: '#666',
        marginBottom: 3,
    },
    deviceRssi: {
        fontSize: 12,
        color: '#666',
    },
    scanningText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#666',
    },
});