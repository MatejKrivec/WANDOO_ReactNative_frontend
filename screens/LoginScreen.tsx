import React, { useState, useEffect } from 'react';
import { Text, TextInput, Button, StyleSheet, Alert, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as Location from 'expo-location'; 
import { signIn } from '../services/auth.service';

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
  const [locationGranted, setLocationGranted] = useState(false);

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

      console.log('Latitude:', location.coords.latitude);
      console.log('Longitude:', location.coords.longitude);
      setLocationGranted(true);
    } catch (error) {
      console.error('Location Error:', error);
      setLocationGranted(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const handleLogin = async () => {
    if (!name || !surname || !password) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    if (!locationGranted) {
      Alert.alert('Error', 'Location permission is required to proceed!');
      return;
    }

    const username = `${name.trim()}_${surname.trim()}`;

    try {
      const data = await signIn(username, password);
      console.log('Login successful:', data);

      setTimeout(() => {
        navigation.replace('Landing', { latitude, longitude });
      }, 500);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.locationMessage}>
          In order to login, you must allow location access.
        </Text>
        <TextInput style={styles.input} placeholder="First Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Last Name" value={surname} onChangeText={setSurname} />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title="Login" onPress={handleLogin} disabled={!locationGranted} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
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
    textAlign: 'center',
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