import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as SecureStore from 'expo-secure-store'; // Import SecureStore
import AsyncStorage from '@react-native-async-storage/async-storage';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('Matej');
  const [surname, setSurname] = useState('Krivec');
  const [password, setPassword] = useState('Matej123!');

  const storeToken = async (token: string) => {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem('authToken', token);
    } else {
      await SecureStore.setItemAsync('authToken', token);
    }
  };

  const handleLogin = async () => {
    if (!name || !surname || !password) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    const username = `${name.trim()}_${surname.trim()}`;

    try {
      const response = await fetch('http://localhost:3000/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful:", data);
  
        // ✅ Store the token securely based on the platform
        await storeToken(data.AuthenticationResult.AccessToken);
  
        Alert.alert('Success', 'Login successful!');
        navigation.replace('Landing'); // Navigate to Landing screen
      } else {
        Alert.alert('Error', data.message || 'Failed to login');
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Screen</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={surname}
        onChangeText={setSurname}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
});

export default LoginScreen;
