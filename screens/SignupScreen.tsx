import React, { useState } from 'react';
import { 
  View, Text, TextInput, Button, StyleSheet, Alert 
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type SignupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Signup'>;

type Props = {
  navigation: SignupScreenNavigationProp;
};

const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !surname || !age || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }
  
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }
  
    // Make sure the username is valid for Cognito
    const username = `${name.trim()}_${surname.trim()}`;
    const usernamePattern = /^[\p{L}\p{M}\p{S}\p{N}\p{P}]+$/u;
  
    if (!usernamePattern.test(username)) {
      Alert.alert('Error', 'Invalid username format.');
      return;
    }
  
    try {
      setLoading(true);
  
      // Sign up with Cognito
      const response = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          age: parseInt(age, 10),
        }),
      });
  
      const data = await response.json();
      setLoading(false);
  
      if (response.ok) {
        console.log("response" + data)
        console.log("response stringified" + JSON.stringify(data))
        const userId = data.UserSub; // Cognito user ID
        console.log("User ID from Cognito:", userId);
  
        // Create user profile in your backend (use hardcoded picture)
        await fetch('http://localhost:3000/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cognitoId: userId, // Store Cognito user ID
            name,
            email,
            age: parseInt(age, 10),
          }),
        });
  
        Alert.alert('Success', 'Account created! Please verify your email.');
        navigation.navigate('ConfirmSignup', { username, email });  // Pass user ID to confirmation screen
      } else {
        Alert.alert('Error', data.message || 'Failed to register');
      }
    } catch (error) {
      setLoading(false);
      console.error('Signup Error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Name" 
        value={name} 
        onChangeText={setName} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Surname" 
        value={surname} 
        onChangeText={setSurname} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Age" 
        value={age} 
        onChangeText={setAge} 
        keyboardType="numeric" 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        keyboardType="email-address" 
        autoCapitalize="none" 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Confirm Password" 
        value={confirmPassword} 
        onChangeText={setConfirmPassword} 
        secureTextEntry 
      />
      <Button title={loading ? 'Registering...' : 'Register'} onPress={handleSignup} disabled={loading} />
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

export default SignupScreen;
