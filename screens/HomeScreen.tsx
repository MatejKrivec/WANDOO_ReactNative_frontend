import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import globalStyles from '../assets/styles/globalstyles';


type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  console.time('HomeScreen render time'); // začetek merjenja

  useEffect(() => {
    console.timeEnd('HomeScreen render time'); // konec merjenja
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wandoo</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={globalStyles.defaultButton} onPress={() => navigation.navigate('Login')}>
          <Text style={globalStyles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={globalStyles.defaultButton} onPress={() => navigation.navigate('Signup')}>
          <Text style={globalStyles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    marginBottom: 20,
    color: 'lightblue',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 100,
  },
});

export default HomeScreen;