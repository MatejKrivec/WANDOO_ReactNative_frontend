import React, { useState } from 'react';
import { 
  View, Text, TextInput, Button, StyleSheet, Alert, Platform, KeyboardAvoidingView, ScrollView, 
  TouchableOpacity
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { signUp } from '../services/auth.service';
import { createProfile } from '../services/profile.service';
import globalStyles from '../assets/styles/globalstyles';

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
  
    try {
      setLoading(true);
  
      const signUpResponse = await signUp(name, surname, age, email, password);
  
      const userId = signUpResponse.UserSub; 
      console.log('User ID from Cognito:', userId);
  
      await createProfile(userId, name, email, parseInt(age, 10));
  
      Alert.alert('Success', 'Account created! Please verify your email.');
      navigation.navigate('ConfirmSignup', { username: `${name}_${surname}`, email });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
        <TouchableOpacity 
          style={[globalStyles.defaultButton, loading && globalStyles.disabledButton]} 
          onPress={handleSignup} 
          disabled={loading}
        >
          <Text style={globalStyles.buttonText}>{loading ? 'Registering...' : 'Register'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  scrollContainer: {
    flexGrow: 1,
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

export default SignupScreen;