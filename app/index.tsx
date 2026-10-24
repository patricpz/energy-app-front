import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import Login from "./(auth)/login";
import { useAuthContext } from "@/modules/auth/context/AuthContext";

export default function Index() {
  const [loaded] = useFonts({
    Digital: require("../assets/fonts/digital_7/digital-7.ttf"),
  });

  const router = useRouter();
  const { user, loading } = useAuthContext();

  useEffect(() => {
    if (!loaded || loading) return;

    // Se o usuário estiver logado, redireciona para home
    if (user) {
      router.replace("/home");
    }
  }, [loaded, loading, user, router]);

  // 🔹 Enquanto a fonte carrega ou está verificando autenticação, mostra um loading simples
  if (!loaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#00FF87" />
      </View>
    );
  }

  // 🔹 Se não estiver logado, mostra a tela de login
  if (!user) {
    return <Login />;
  }

  // 🔹 Se estiver logado, não mostra nada (será redirecionado)
  return null;
}
