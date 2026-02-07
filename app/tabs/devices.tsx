import {
  PlusIcon,
  TrashIcon
} from 'phosphor-react-native';

import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import ModalAddDevice from '../components/ModalAddDevice';
import { useTheme } from '../context/ThemeContext';
import SafeScreen from '../SafeScreen';
import { deleteDevice, DomesticEquipment, getDevices } from '../services/devices';
import { deviceStyles as styles } from './styles/deviceStyle';

type FilterType = 'todos' | 'ligados' | 'desligados';

interface Device {
  id: string | number;
  name: string;
  consumption: number;
  online: boolean;
  active: boolean;
}
function mapApiDeviceToDevice(apiDevice: DomesticEquipment): Device {
  return {
    id: apiDevice.id || '',
    name: apiDevice.name,
    consumption: apiDevice.consumeKwh,
    online: true,
    active: true,
  };
}

export default function Devices() {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState<FilterType>('todos');
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const apiDevices = await getDevices();
      const mappedDevices = apiDevices.map(mapApiDeviceToDevice);
      setDevices(mappedDevices);
    } catch (error: any) {
      console.error('Erro ao carregar dispositivos:', error);
      Alert.alert(
        'Erro',
        error.message || 'Não foi possível carregar os dispositivos. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const activeDevices = devices.filter(d => d.active).length;
  const totalDevices = devices.length;
  const currentConsumption = devices
    .filter(d => d.active)
    .reduce((sum, d) => sum + d.consumption, 0);

  const filteredDevices = devices.filter(device => {
    if (filter === 'ligados') return device.active;
    if (filter === 'desligados') return !device.active;
    return true;
  });

  async function handleSaveDevice() {
    await loadDevices();
  }

  async function handleDeleteDevice(deviceId: string | number) {
    const idString = String(deviceId);
    
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este dispositivo?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(idString);
              await deleteDevice(idString);
              Alert.alert('Sucesso', 'Dispositivo excluído com sucesso!');
              await loadDevices();
            } catch (error: any) {
              console.error('Erro ao deletar dispositivo:', error);
              Alert.alert(
                'Erro',
                error.message || 'Não foi possível excluir o dispositivo. Tente novamente.'
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  }

  const colors = theme.colors;

  return (
    <SafeScreen>
      <View style={[styles(theme).container]}>
        <Header />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles(theme).headerRow}>
            <View style={styles(theme).titleContainer}>
              <Text style={styles(theme).title}>Dispositivos</Text>
            </View>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <PlusIcon size={28} color={colors.primary} weight="bold" />
            </TouchableOpacity>
          </View>

          <View style={styles(theme).summaryCards}>
            <View style={[styles(theme).summaryCard, { backgroundColor: colors.card, marginRight: 6 }]}>
              <Text style={[styles(theme).summaryValue, { color: colors.primary }]}>
                {activeDevices}
              </Text>
              <Text style={[styles(theme).summaryLabel, { color: colors.textSecondary }]}>
                Ligados
              </Text>
            </View>
            <View style={[styles(theme).summaryCard, { backgroundColor: colors.card, marginHorizontal: 6 }]}>
              <Text style={[styles(theme).summaryValue, { color: colors.primary }]}>
                {currentConsumption.toFixed(1)}
              </Text>
              <Text style={[styles(theme).summaryLabel, { color: colors.textSecondary }]}>
                kWh Agora
              </Text>
            </View>
            <View style={[styles(theme).summaryCard, { backgroundColor: colors.card, marginLeft: 6 }]}>
              <Text style={[styles(theme).summaryValue, { color: colors.primary }]}>
                {totalDevices}
              </Text>
              <Text style={[styles(theme).summaryLabel, { color: colors.textSecondary }]}>
                Total
              </Text>
            </View>
          </View>

          <View style={styles(theme).filtersContainer}>
            <TouchableOpacity
              style={[
                styles(theme).filterButton,
                filter === 'todos' && styles(theme).filterButtonActive,
                { backgroundColor: filter === 'todos' ? colors.primary : colors.card, marginRight: 6 }
              ]}
              onPress={() => setFilter('todos')}
            >
              <Text
                style={[
                  styles(theme).filterText,
                  { color: filter === 'todos' ? colors.buttonText : colors.textSecondary }
                ]}
              >
                Todos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles(theme).filterButton,
                filter === 'ligados' && styles(theme).filterButtonActive,
                { backgroundColor: filter === 'ligados' ? colors.primary : colors.card, marginHorizontal: 6 }
              ]}
              onPress={() => setFilter('ligados')}
            >
              <Text
                style={[
                  styles(theme).filterText,
                  { color: filter === 'ligados' ? colors.buttonText : colors.textSecondary }
                ]}
              >
                Ligados
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles(theme).filterButton,
                filter === 'desligados' && styles(theme).filterButtonActive,
                { backgroundColor: filter === 'desligados' ? colors.primary : colors.card, marginLeft: 6 }
              ]}
              onPress={() => setFilter('desligados')}
            >
              <Text
                style={[
                  styles(theme).filterText,
                  { color: filter === 'desligados' ? colors.buttonText : colors.textSecondary }
                ]}
              >
                Desligados
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles(theme).devicesList}>
            {loading ? (
              <View style={styles(theme).loadingContainer}>
                <Text style={[styles(theme).loadingText, { color: colors.textSecondary }]}>
                  Carregando dispositivos...
                </Text>
              </View>
            ) : filteredDevices.length === 0 ? (
              <View style={styles(theme).emptyContainer}>
                <Text style={[styles(theme).emptyText, { color: colors.textSecondary }]}>
                  {devices.length === 0 
                    ? 'Nenhum dispositivo cadastrado. Adicione um novo dispositivo!'
                    : 'Nenhum dispositivo encontrado com este filtro.'}
                </Text>
              </View>
            ) : (
              filteredDevices.map((device) => (
                <View key={device.id} style={[styles(theme).deviceCard, { backgroundColor: colors.card }]}>
                  <View style={styles(theme).deviceInfoRow}>

                    <View style={styles(theme).deviceInfo}>
                      <Text style={[styles(theme).deviceName, { color: colors.text }]}>
                        {device.name}
                      </Text>
                      <View style={styles(theme).consumptionRow}>
                        <Text style={[styles(theme).consumptionLabel, { color: colors.textSecondary }]}>
                          Consumo
                        </Text>
                        <Text style={[styles(theme).consumptionValue, { color: colors.primary, marginLeft: 6 }]}>
                          {device.consumption} kWh
                        </Text>
                      </View>
                      <View style={styles(theme).statusRow}>
                        <View
                          style={[
                            styles(theme).statusDot,
                            { backgroundColor: device.online ? colors.primary : colors.textTertiary, marginRight: 6 }
                          ]}
                        />
                        <Text
                          style={[
                            styles(theme).statusText,
                            { color: device.online ? colors.primary : colors.textTertiary }
                          ]}
                        >
                          {device.online ? 'Ligado' : 'Desligado'}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleDeleteDevice(device.id)}
                      style={styles(theme).deleteButton}
                      disabled={deletingId === String(device.id)}
                    >
                      <TrashIcon 
                        size={20} 
                        color={deletingId === String(device.id) ? colors.textTertiary : colors.textSecondary} 
                        weight="regular" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <ModalAddDevice
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleSaveDevice}
        />

      </View>
    </SafeScreen>
  );
}


