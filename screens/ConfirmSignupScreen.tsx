import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type ConfirmSignupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ConfirmSignup'>;
type ConfirmSignupScreenRouteProp = RouteProp<RootStackParamList, 'ConfirmSignup'>;

type Props = {
  navigation: ConfirmSignupScreenNavigationProp;
  route: ConfirmSignupScreenRouteProp;
};

const ConfirmSignupScreen: React.FC<Props> = ({ navigation, route }) => {
  const { username } = route.params;
  const { email } = route.params;
  const [code, setCode] = useState('');

  const handleConfirm = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/confirm-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, code }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Your account is now verified. Please login.');
        navigation.navigate('Login'); 
      } else {
        Alert.alert('Error', data.message || 'Failed to confirm signup');
      }
    } catch (error) {
      console.error('Confirmation Error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Signup</Text>
      <Text>Please enter the verification code sent to {email}.</Text>
      <TextInput
        style={styles.input}
        placeholder="Verification Code"
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
      />
      <Button title="Confirm" onPress={handleConfirm} />
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

export default ConfirmSignupScreen;
