import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';

import AuthScreen from './screens/AuthScreen';
import NotesScreen from './screens/NotesScreen';

export type RootStackParamList = {
  Auth: undefined;
  Notes: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) return null; // petit état de chargement

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Notes">
          {() => (
            <NotesScreen
              onLogout={async () => {
                await AsyncStorage.removeItem('token');
                setIsAuthenticated(false);
              }}
            />
          )}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Auth">
          {() => (
            <AuthScreen
              onAuthSuccess={async (token) => {
                await AsyncStorage.setItem('token', token);
                setIsAuthenticated(true);
              }}
            />
          )}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}
