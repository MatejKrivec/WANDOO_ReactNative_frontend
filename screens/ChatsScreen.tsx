import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type ChatsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChatsScreen'>;

type Props = {
  navigation: ChatsScreenNavigationProp;
};

const chats = [
  {
    id: '1',
    title: 'Hiking Adventure',
    lastMessage: 'Hey, are we still going on the hike tomorrow?',
    date: 'March 19, 2025',
    image: require('../assets/images/img-krnes_smrekovec_koroska.jpg'), // Example image
  },
  {
    id: '2',
    title: 'Beach Party',
    lastMessage: 'Looking forward to the party on the weekend!',
    date: 'March 18, 2025',
    image: require('../assets/images/img-krnes_smrekovec_koroska.jpg'), // Example image
  },
  {
    id: '3',
    title: 'Mountain Climbing',
    lastMessage: 'We need to pack our gear for the climb.',
    date: 'March 17, 2025',
    image: require('../assets/images/img-krnes_smrekovec_koroska.jpg'), // Example image
  },
];

const ChatsScreen: React.FC<Props> = ({ navigation }) => {
  const renderChat = ({ item }: { item: typeof chats[0] }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => {
        navigation.navigate('ChatRoom', { title: item.title, image: item.image });
      }}
    >
      <Image source={item.image} style={styles.chatImage} />
      <View style={styles.chatDetails}>
        <Text style={styles.chatTitle}>{item.title}</Text>
        <Text style={styles.chatMessage}>{item.lastMessage}</Text>
        <Text style={styles.chatDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderChat}
        keyExtractor={(item) => item.id}
        style={styles.chatList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2', // Light background color
  },
  chatList: {
    paddingTop: 10,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5, // For Android shadow
  },
  chatImage: {
    width: 60,
    height: 60,
    borderRadius: 30, // Circular image
    marginRight: 15,
  },
  chatDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chatMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  chatDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
});

export default ChatsScreen;
