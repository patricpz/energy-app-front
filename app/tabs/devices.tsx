import {
    DesktopIcon,
    FanIcon,
    IceCreamIcon,
    TelevisionSimpleIcon,
    WashingMachineIcon
} from 'phosphor-react-native';

import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function Devices() {
  const { theme } = useTheme();

  const devices: Device[] = [
    { 
      id: 1, 
      name: 'TV da sala de estar',
      icon: (color, size) => <TelevisionSimpleIcon color={color} size={size} weight="duotone" />,
      consumption: '0.15 kWh',
      online: true,
      active: true 
    },
    { 
      id: 2, 
      name: 'Geladeira de cozinha',
      icon: (color, size) => <FanIcon color={color} size={size} weight="duotone" />,
      consumption: '0.45 kWh',
      online: true,
      active: true 
    },
    { 
      id: 3, 
      name: 'Quarto AC',
      icon: (color, size) => <IceCreamIcon color={color} size={size} weight="duotone" />,
      consumption: '1.2 kWh',
      online: false,
      active: false 
    },
    { 
      id: 4, 
      name: 'Pc escritório',
      icon: (color, size) => <DesktopIcon color={color} size={size} weight="duotone" />,
      consumption: '0.25 kWh',
      online: true,
      active: true 
    },
    { 
      id: 5, 
      name: 'Máquina de lavar',
      icon: (color, size) => <WashingMachineIcon color={color} size={size} weight="duotone" />,
      consumption: '0.8 kWh',
      online: false,
      active: false 
    },
  ];

  return (
    <View style={[styles(theme).container]}>
      <Text style={styles(theme).title}>Dispositivos</Text>

      <ScrollView style={{ marginTop: 16 }}>
        {devices.map((device) => (
          <View key={device.id} style={styles(theme).card}>
            <View style={styles(theme).infoRow}>

              {/* Renderiza o ícone corretamente */}
              <View style={{ marginRight: 14 }}>
                {device.icon(theme.colors.text, 40)}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles(theme).deviceName}>{device.name}</Text>
                <Text style={styles(theme).consumption}>
                  Consumo: <Text style={{ color: '#4CAF50' }}>{device.consumption}</Text>
                </Text>
                <Text style={[
                    styles(theme).status, 
                    { color: device.online ? '#4CAF50' : '#F44336' }
                ]}>
                  • {device.online ? 'Online' : 'Offline'}
                </Text>
              </View>

              <Switch 
                value={device.active}
                trackColor={{ true: theme.colors.primary }}
              />

            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

interface Device {
  id: number;
  name: string;
  icon: (color: string, size: number) => React.ReactNode;
  consumption: string;
  online: boolean;
  active: boolean;
}

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  card: {
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  consumption: {
    marginTop: 4,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  status: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '500',
  },
});
