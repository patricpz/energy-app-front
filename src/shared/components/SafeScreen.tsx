import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SafeScreen({ children, style }: any) {
  return (
    <SafeAreaView
      style={[styles.container, style]}
      edges={["top", "left", "right"]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
