// app/_layout.tsx
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Layout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Ex: check dans AsyncStorage ou API
      await new Promise(res => setTimeout(res, 1000));
      setIsAuthenticated(false); // change en true si connecté
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      {isAuthenticated ? (
        <Stack.Screen name="screens/NotesScreen" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="screens/AuthScreen" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}
