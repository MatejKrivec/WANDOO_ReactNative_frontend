import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const getToken = async () => {
    return Platform.OS === 'web'
      ? await AsyncStorage.getItem('authToken')
      : await SecureStore.getItemAsync('authToken');
  };

  export const storeToken = async (token: string) => {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem('authToken', token);
    } else {
      await SecureStore.setItemAsync('authToken', token);
    }
  };