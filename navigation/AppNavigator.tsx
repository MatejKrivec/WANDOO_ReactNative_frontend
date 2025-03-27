import React from 'react';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerContentComponentProps } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ConfirmSignupScreen from '../screens/ConfirmSignupScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WandoosScreen from '../screens/WandoosScreen';
import MyWandoosScreen from '../screens/MyWandoosScreen';
import FriendsScreen from '../screens/FriendsScreen';
import ChatsScreen from '../screens/ChatsScreen';
import ChatRoom from '../components/ChatRoom';
import { View, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Signup: undefined;
  Landing: { latitude: number | null; longitude: number | null };  
  Wandoos: { latitude: number | null; longitude: number | null };
  ChatsScreen: undefined;
  ChatRoom: { title: string; image: any, id: any };
  ConfirmSignup: { username: string, email: string };
};

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

const deleteToken = async () => {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem('authToken');
  } else {
    await SecureStore.deleteItemAsync('authToken');
  }
};

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <DrawerItem
          label="Profile"
          onPress={() => props.navigation.navigate('Profile')}
        />
        <DrawerItem
          label="Wandoos"
          onPress={() => props.navigation.navigate('Wandoos')}
        />
        <DrawerItem
          label="My Wandoos"
          onPress={() => props.navigation.navigate('MyWandoos')}
        />
        <DrawerItem
          label="Friends"
          onPress={() => props.navigation.navigate('Friends')}
        />
        <DrawerItem
          label="Chats"
          onPress={() => props.navigation.navigate('Chats')}
        />
      </View>

      <View style={{ borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 10 }}>
        <DrawerItem
          label="Logout"
          onPress={async () => {
            // Delete the token
            await deleteToken();

            // Reset the navigation stack and navigate to Login screen
            props.navigation.reset({
              index: 0, // Ensure the login screen is the only screen in the stack
              routes: [{ name: 'Login' }],
            });
          }}
        />
      </View>
    </DrawerContentScrollView>
  );
};

const DrawerNavigator = ({ route }: { route: RouteProp<RootStackParamList, 'Landing'> }) => {
  const { latitude, longitude } = route.params;
  const WandoosWrapper = (props: any) => {
    return <WandoosScreen {...props} />;
  };
  
  return (
    <Drawer.Navigator 
      initialRouteName="Wandoos"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen 
        name="Wandoos" 
        component={WandoosWrapper} 
        initialParams={{ latitude, longitude }}  
      />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="MyWandoos" component={MyWandoosScreen} />
      <Drawer.Screen name="Friends" component={FriendsScreen} />
      <Drawer.Screen name="Chats" component={ChatsScreen} />
    </Drawer.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: true }} 
        />
        <Stack.Screen 
          name="Signup" 
          component={SignupScreen} 
          options={{ headerShown: true }} 
        />
         <Stack.Screen 
          name="ConfirmSignup" 
          component={ConfirmSignupScreen} 
          options={{ headerShown: true }} 
        />
        <Stack.Screen 
          name="Landing" 
          component={DrawerNavigator} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ChatRoom" 
          component={ChatRoom} 
          options={{ headerShown: true }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;