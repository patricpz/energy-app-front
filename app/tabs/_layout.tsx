import { Tabs } from "expo-router";
import { ChartLineIcon, HouseIcon, NotebookIcon, UserIcon } from "phosphor-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#111827",
          borderTopColor: "#111827",
          paddingTop: 10
        },
        tabBarActiveTintColor: "#1ab65c",
        tabBarInactiveTintColor: "#757575",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="home"
        options={{
          tabBarIcon: ({ color, size }) => (
            <HouseIcon color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen name="analisty"
        options={{
          tabBarIcon: ({ color, size }) => (
            <ChartLineIcon size={size} color= {color} />

          )
        }}
      />
      <Tabs.Screen name="booking"
        options={{
          tabBarIcon: ({ color, size }) => (
            <NotebookIcon color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen name="profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <UserIcon color={color} size={size} />
          )
        }}
      />
    </Tabs>
  );
}