import { Tabs } from "expo-router";
import { BellIcon, ChartLineIcon, ChatTeardropText, DevicesIcon, HouseIcon, UserIcon, WrenchIcon } from "phosphor-react-native";
import { useTheme } from "../context/ThemeContext";

export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBackground,
          borderTopColor: theme.colors.border,
          paddingTop: 10,
          paddingBottom: 10,
          height: 90,
        },
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 4,
        },
      }}
    >


      <Tabs.Screen name="home"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <HouseIcon color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen name="analisty"
        options={{
          tabBarLabel: "Analytics",
          tabBarIcon: ({ color, size }) => (
            <ChartLineIcon size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen name="booking"
        options={{
          tabBarLabel: "ESP32",
          tabBarIcon: ({ color, size }) => (
            <WrenchIcon color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen name="devices"
        options={{
          tabBarLabel: "Dispositivos",
          tabBarIcon: ({ color, size }) => (
            <DevicesIcon color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen name="websocket"
        options={{
          tabBarLabel: "WebSocket",
          tabBarIcon: ({ color, size }) => (
            <ChatTeardropText color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen name="alerts"
        options={{
          tabBarLabel: "Alerts",
          tabBarIcon: ({ color, size }) => (
            <BellIcon color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen name="profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <UserIcon color={color} size={size} />
          )
        }}
      />
    </Tabs>
  );
}