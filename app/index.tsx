import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import Login from "./stacks/auth/login";

export default function Index() {
  const [loaded] = useFonts({
    Digital: require("../assets/fonts/digital_7/digital-7.ttf"),
  });

  const router = useRouter();

  useEffect(() => {
    if (!loaded) return;

    const timeout = setTimeout(() => {
      const isLoggedIn = false;

      if (isLoggedIn) {
        router.replace("/tabs/home");
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [loaded, router]);

  // 🔹 Enquanto a fonte carrega, mostra um loading simples
  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#00FF87" />
      </View>
    );
  }

  // 🔹 Mostra a tela de login por padrão (se não estiver logado)
  return <Login />;
}
