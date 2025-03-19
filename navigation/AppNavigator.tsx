import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerContentComponentProps } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WandoosScreen from '../screens/WandoosScreen';
import MyWandoosScreen from '../screens/MyWandoosScreen';
import FriendsScreen from '../screens/FriendsScreen';
import ChatsScreen from '../screens/ChatsScreen';
import ChatRoom from '../screens/ChatRoom';
import { View } from 'react-native';

// Define types for stack navigation
export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Landing: undefined;
  ChatsScreen: undefined;
  ChatRoom: { title: string; image: any };
};

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

// Custom Drawer content
export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* Drawer Items */}
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

      {/* Logout Button - Placed at the Bottom */}
      <View style={{ borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 10 }}>
        <DrawerItem
          label="Logout"
          onPress={() => {
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

// Drawer Navigator
const DrawerNavigator = () => {
  return (
    <Drawer.Navigator 
      initialRouteName="Wandoos" // Set "Wandoos" as the default selected screen
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Wandoos" component={WandoosScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="MyWandoos" component={MyWandoosScreen} />
      <Drawer.Screen name="Friends" component={FriendsScreen} />
      <Drawer.Screen name="Chats" component={ChatsScreen} />
    </Drawer.Navigator>
  );
};

// AppNavigator with Stack Navigator
const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} // Hide header for Home
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: true }} // Show header for Login
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ headerShown: true }} // Show header for Register
        />
        <Stack.Screen 
          name="Landing" 
          component={DrawerNavigator} 
          options={{ headerShown: false }} // Hide header for Landing (Drawer Navigator)
        />
        <Stack.Screen 
          name="ChatRoom" 
          component={ChatRoom} // Add ChatRoom screen to the stack
          options={{ headerShown: true }} // Show header for ChatRoom
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Default export for AppNavigator
export default AppNavigator;
