import React, { useState, useEffect } from 'react';
import { Text, TextInput, StyleSheet, Alert, Platform, KeyboardAvoidingView, ScrollView, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as Location from 'expo-location'; //UVOZ LOCATION MODULA
import { signIn } from '../services/auth.service';
import globalStyles from '../assets/styles/globalstyles';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [password, setPassword] = useState('');
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

      const location = await Location.getCurrentPositionAsync({});  //PRIDOBIVANJE LOKACIJE
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
  console.time('Form submission time'); // Začetek merjenja časa

  if (!name || !surname || !password) {
    Alert.alert('Error', 'All fields are required!');
    console.timeEnd('Form submission time'); // Končaj merjenje, če je napaka
    return;
  }

  if (!locationGranted) {
    Alert.alert('Error', 'Location permission is required to proceed!');
    console.timeEnd('Form submission time'); // Končaj merjenje, če ni dovoljenja
    return;
  }

  const username = `${name.trim()}_${surname.trim()}`;

  try {
    const data = await signIn(username, password);
    console.log('Login successful');
  } catch (error: any) {
    Alert.alert('Error', error.message || 'Something went wrong');
  } finally {
    console.timeEnd('Form submission time'); // Končaj merjenje po zaključku prijave
  }

  setTimeout(() => {
    navigation.replace('Landing', { latitude, longitude });
  }, 500);
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} > {/* PRIMER UPORABE PLATFORM MODULA */}                 
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.locationMessage}>
          In order to login, you must allow location access.
        </Text>
        <TextInput style={styles.input} placeholder="First Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Last Name" value={surname} onChangeText={setSurname} />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity 
          style={[globalStyles.defaultButton, !locationGranted && globalStyles.disabledButton]} 
          onPress={handleLogin} 
          disabled={!locationGranted}
        >
          <Text style={globalStyles.buttonText}>Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    width: Platform.OS === 'web' ? 300 : undefined
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