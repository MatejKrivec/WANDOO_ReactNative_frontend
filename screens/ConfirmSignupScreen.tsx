import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { confirmSignup } from '../services/auth.service';
import globalStyles from '../assets/styles/globalstyles';

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
      await confirmSignup(username, code);
      Alert.alert('Success', 'Your account is now verified. Please login.');
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to confirm signup');
    }
  };

  return (
    <View style={styles.container}>
        <View style={styles.scroolContainer}>
          <Text style={styles.title}>Confirm Signup</Text>
          <Text>Please enter the verification code sent to {email}.</Text>
          <TextInput
            style={styles.input}
            placeholder="Verification Code"
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
          />
            <TouchableOpacity style={globalStyles.defaultButton} onPress={handleConfirm}>
              <Text style={globalStyles.buttonText}>Confirm</Text>
            </TouchableOpacity>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  scroolContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    width: 300 
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
