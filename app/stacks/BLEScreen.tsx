import React, { useState } from 'react';
import {
  Button,
  LogBox,
  PermissionsAndroid,
  StyleSheet,
  Text,
  TextInput, // Importante: Importar TextInput
  TouchableOpacity,
  View,
} from 'react-native';

import base64 from 'react-native-base64';
import { BleManager, Device } from 'react-native-ble-plx';

// Configurações de Log
LogBox.ignoreLogs(['new NativeEventEmitter']); 
LogBox.ignoreAllLogs(); 

const BLTManager = new BleManager();

// UUIDs (Devem ser IDÊNTICOS aos do ESP32)
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const MESSAGE_UUID = '6d68efe5-04b6-4a85-abc4-c2670b7bf7fd';
const BOX_UUID = 'f27b53ad-c63d-49a0-8c0f-9f297e6cc520';

export default function BLEScreen() {
  // Is a device connected?
  const [isConnected, setIsConnected] = useState(false);

  // What device is connected?
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

  const [message, setMessage] = useState('Nothing Yet');
  
  // MUDANÇA: Agora o valor é uma String para texto, não boolean
  const [boxvalue, setBoxValue] = useState(""); 

  // Scans available BLT Devices and then call connectDevice
  async function scanDevices() {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Permission Localisation Bluetooth',
        message: 'Requirement for Bluetooth',
        buttonNeutral: 'Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    ).then(answere => {
      console.log('scanning');

      BLTManager.startDeviceScan(null, null, (error, scannedDevice) => {
        if (error) {
          console.warn(error);
        }

        if (scannedDevice && scannedDevice.name == 'BLEExample') {
          BLTManager.stopDeviceScan();
          connectDevice(scannedDevice);
        }
      });

      // stop scanning devices after 5 seconds
      setTimeout(() => {
        BLTManager.stopDeviceScan();
      }, 5000);
    });
  }

  // handle the device disconnection
  async function disconnectDevice() {
    console.log('Disconnecting start');

    if (connectedDevice != null) {
      const isDeviceConnected = await connectedDevice.isConnected();
      if (isDeviceConnected) {
        BLTManager.cancelTransaction('messagetransaction');
        BLTManager.cancelTransaction('boxtransaction');

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

  // Function to send data to ESP32
  // MUDANÇA: Recebe string e envia string
  async function sendBoxValue(value: string): Promise<void> {
    if(!connectedDevice) return;

    BLTManager.writeCharacteristicWithResponseForDevice(
      connectedDevice.id,
      SERVICE_UUID,
      BOX_UUID,
      base64.encode(value), // Codifica o texto para Base64
    ).then((characteristic: any) => {
      console.log('Boxvalue sent:', base64.decode(characteristic.value));
    }).catch((err: Error) => console.log("Erro ao enviar", err));
  }

  // Connect the device and start monitoring characteristics
  async function connectDevice(device: Device): Promise<void> {
    console.log('connecting to Device:', device.name);

    device
      .connect()
      .then((device: Device) => {
        setConnectedDevice(device);
        setIsConnected(true);
        return device.discoverAllServicesAndCharacteristics();
      })
      .then((device: Device) => {
        // Set what to do when DC is detected
        BLTManager.onDeviceDisconnected(device.id, (error: Error | null, device: Device | null) => {
          console.log('Device DC');
          setIsConnected(false);
        });

        // --- Leitura de Valores Iniciais ---

        // Message (Lê a mensagem de sucesso que o ESP define ao conectar)
        device
          .readCharacteristicForService(SERVICE_UUID, MESSAGE_UUID)
          .then((valenc: any) => {
            if(valenc?.value) {
              setMessage(base64.decode(valenc.value));
            }
          });

        // BoxValue
        device
          .readCharacteristicForService(SERVICE_UUID, BOX_UUID)
          .then((valenc: any) => {
            if(valenc?.value) {
              setBoxValue(base64.decode(valenc.value));
            }
          });

        // --- Monitoramento (Notificações) ---

        // Message Monitor
        device.monitorCharacteristicForService(
          SERVICE_UUID,
          MESSAGE_UUID,
          (error: Error | null, characteristic: any) => {
            if (characteristic?.value != null) {
              setMessage(base64.decode(characteristic.value));
              console.log('Message update received: ', base64.decode(characteristic.value));
            }
          },
          'messagetransaction',
        );

        // BoxValue Monitor
        device.monitorCharacteristicForService(
          SERVICE_UUID,
          BOX_UUID,
          (error: Error | null, characteristic: any) => {
            if (characteristic?.value != null) {
              // Atualiza o input com o que o ESP responder (eco)
              setBoxValue(base64.decode(characteristic.value));
              console.log('Box Value update received: ', base64.decode(characteristic.value));
            }
          },
          'boxtransaction',
        );

        console.log('Connection established');
      });
  }

  return (
    <View>
      <View style={{paddingBottom: 100}}></View>

      {/* Title */}
      <View style={styles.rowView}>
        <Text style={styles.titleText}>BLE Example</Text>
      </View>

      <View style={{paddingBottom: 20}}></View>

      {/* Connect Button */}
      <View style={styles.rowView}>
        <TouchableOpacity style={{width: 120}}>
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
              title="Disconnect"
              onPress={() => {
                disconnectDevice();
              }}
              disabled={false}
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={{paddingBottom: 20}}></View>

      {/* Message Area */}
      <View style={styles.rowView}>
        <Text style={styles.baseText}>Status: {message}</Text>
      </View>

      <View style={{paddingBottom: 20}}></View>

      {/* MUDANÇA: Área de Input de Texto */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Enviar para ESP32:</Text>
        <TextInput
          style={styles.input}
          value={boxvalue}
          onChangeText={(text) => setBoxValue(text)}
          placeholder="Digite aqui..."
        />
        <Button 
            title="Enviar Texto" 
            onPress={() => sendBoxValue(boxvalue)}
            disabled={!isConnected}
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  baseText: {
    fontSize: 18,
    fontFamily: 'Cochin',
    color: '#333',
    fontWeight: 'bold',
  },
  titleText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20
  },
  rowView: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 20
  },
  // Estilos para o Input
  inputContainer: {
    paddingHorizontal: 30,
    justifyContent: 'center',
    width: '100%',
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    fontWeight: 'bold'
  },
  input: {
    height: 40,
    marginVertical: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    borderColor: '#ccc',
    width: '100%',
    backgroundColor: '#fff'
  },
});