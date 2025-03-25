import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wandoo</Text>
      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title="Login" onPress={() => navigation.navigate('Login')} />
        </View>
        <View style={styles.button}>
          <Button title="Register" onPress={() => navigation.navigate('Signup')} />
        </View>
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
  button: {
    marginVertical: 10,
  },
});

export default HomeScreen;