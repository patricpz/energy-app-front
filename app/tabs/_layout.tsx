import { Tabs } from "expo-router";
import { DevicesIcon, HouseIcon, UserIcon } from "phosphor-react-native";
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
          height: 100,
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
          tabBarLabel: "Testee",
          tabBarIcon: ({ color, size }) => (
            <DevicesIcon color={color} size={size} />
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

      <Tabs.Screen name="profile"
        options={{
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <UserIcon color={color} size={size} />
          )
        }}
      />
    </Tabs>
  );
}