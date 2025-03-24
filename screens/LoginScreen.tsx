import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location'; // Import Location API

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('Matej');
  const [surname, setSurname] = useState('Krivec');
  const [password, setPassword] = useState('Matej123!');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationGranted, setLocationGranted] = useState(false); // Track location permission status

  const storeToken = async (token: string) => {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem('authToken', token);
    } else {
      await SecureStore.setItemAsync('authToken', token);
    }
  };

  // Function to fetch user location
  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required for the app to function.');
        setLocationGranted(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      // Log the location to the console
      console.log('Latitude:', location.coords.latitude);
      console.log('Longitude:', location.coords.longitude);
      setLocationGranted(true); // Location permission granted and location fetched
    } catch (error) {
      console.error('Location Error:', error);
      setLocationGranted(false);
    }
  };

  useEffect(() => {
    // Fetch location when the component is mounted
    fetchLocation();
  }, []); // Empty dependency array ensures it runs only once when the component mounts

  const handleLogin = async () => {
    if (!name || !surname || !password) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    // Ensure location is granted and fetched before proceeding
    if (!locationGranted) {
      Alert.alert('Error', 'Location permission is required to proceed!');
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
        console.log('Login successful:', data);
        await storeToken(data.AuthenticationResult.AccessToken);

        // Wait a moment to ensure location is set before navigating
        setTimeout(() => {
          navigation.replace('Landing', { latitude, longitude });
        }, 500);
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
      <Text style={styles.locationMessage}>
        In order to login, you must allow location access.
      </Text>
      <TextInput style={styles.input} placeholder="First Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Last Name" value={surname} onChangeText={setSurname} />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login" onPress={handleLogin} disabled={!locationGranted} />
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
    marginBottom: 10,
  },
  locationMessage: {
    fontSize: 14,
    color: '#777',
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
