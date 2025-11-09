import { Tabs } from "expo-router";
import { HouseIcon, MagnifyingGlassIcon, NotebookIcon, UserIcon } from "phosphor-react-native";

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
      <Tabs.Screen name="search"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MagnifyingGlassIcon color={color} size={size} />
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