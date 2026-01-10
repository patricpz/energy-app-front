import {
  PlusIcon,
  TrashIcon
} from 'phosphor-react-native';

import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import ModalAddDevice from '../components/ModalAddDevice';
import { useTheme } from '../context/ThemeContext';
import SafeScreen from '../SafeScreen';
import { deleteDevice, DomesticEquipment, getDevices } from '../services/devices';

type FilterType = 'todos' | 'ligados' | 'desligados';


// Converter dados da API para o formato da interface
function mapApiDeviceToDevice(apiDevice: DomesticEquipment): Device {
  return {
    id: apiDevice.id || '',
    name: apiDevice.name,
    consumption: apiDevice.consumeKwh,
    online: true, // Por padrão, assumimos que está online (pode ser ajustado quando houver integração com status real)
    active: true, // Por padrão, assumimos que está ativo (pode ser ajustado quando houver integração com status real)
  };
}

export default function Devices() {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState<FilterType>('todos');
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Carregar dispositivos da API
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

  // Carregar dispositivos ao montar o componente
  useEffect(() => {
    loadDevices();
  }, []);

  // Calcular estatísticas
  const activeDevices = devices.filter(d => d.active).length;
  const totalDevices = devices.length;
  const currentConsumption = devices
    .filter(d => d.active)
    .reduce((sum, d) => sum + d.consumption, 0);

  // Filtrar dispositivos
  const filteredDevices = devices.filter(device => {
    if (filter === 'ligados') return device.active;
    if (filter === 'desligados') return !device.active;
    return true;
  });

  async function handleSaveDevice() {
    // Recarregar lista após salvar
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
              // Recarregar lista após deletar
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
          {/* HEADER + BOTÃO */}
          <View style={styles(theme).headerRow}>
            <View style={styles(theme).titleContainer}>
              <Text style={styles(theme).title}>Dispositivos</Text>
            </View>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <PlusIcon size={28} color={colors.primary} weight="bold" />
            </TouchableOpacity>
          </View>

          {/* CARDS DE RESUMO */}
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

          {/* FILTROS */}
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

          {/* LISTA DE DISPOSITIVOS */}
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
                    {/* Ícone */}

                    {/* Informações */}
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

                    {/* Botão de deletar */}
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

        {/* MODAL */}
        <ModalAddDevice
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleSaveDevice}
        />

      </View>
    </SafeScreen>
  );
}

interface Device {
  id: string | number;
  name: string;
  consumption: number;
  online: boolean;
  active: boolean;
}

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },

  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },

  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },

  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
  },

  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterButtonActive: {
    // Estilo adicional se necessário
  },

  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },

  devicesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  deviceCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  deviceInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  deviceIconContainer: {
    marginRight: 14,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deviceInfo: {
    flex: 1,
  },

  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },

  consumptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  consumptionLabel: {
    fontSize: 13,
    fontWeight: '400',
  },

  consumptionValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },

  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },

  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },

  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
