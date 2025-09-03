import axios from 'axios';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_BASE_URL = 'https://note-api-osvu.onrender.com/api';

export default function AuthScreen({ onAuthSuccess }: { onAuthSuccess: (token: string) => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleAuth = async () => {
    try {
      const endpoint = isSignUp ? '/auth/register' : '/auth/login';
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, { email, password, name });
      
      // Supposons que l'API renvoie { token: "xxx" }
      const token = response.data?.token || 'mock-token';
      onAuthSuccess(token);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Authentication failed');
    }
  };
    // Removed unused setName function since we now use useState for name.

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>

    <TextInput
      style={styles.input}
      placeholder="Email"
      value={email}
      autoCapitalize="none"
      onChangeText={setEmail}
    />

    {isSignUp && (
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
    )}

    <TextInput
      style={styles.input}
      placeholder="Password"
      secureTextEntry
      value={password}
      onChangeText={setPassword}
    />

      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>{isSignUp ? 'Register' : 'Login'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.switchText}>
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  switchText: { marginTop: 16, color: '#007AFF', textAlign: 'center' },
});
