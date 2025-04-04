import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StackNavigationProp } from '@react-navigation/stack'; 
import { fetchChatRooms } from '../services/chatroom.service';

type ChatsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChatsScreen'>;

type Props = {
  navigation: ChatsScreenNavigationProp;
};

const ChatsScreen: React.FC<Props> = ({ navigation }) => {

  const [chatRooms, setChatRooms] = useState<any[]>([]); 
 
  const loadChatRooms = async () => {
    try {
      const rooms = await fetchChatRooms();
      setChatRooms(rooms);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadChatRooms();
    }, [])
  );


  const renderChatRoom = ({ item }: { item: typeof chatRooms[0] }) => (
    <TouchableOpacity
      style={styles.chatRoomItem}
      onPress={() => navigation.navigate('ChatRoom', { title: item.title, image: item.picture, id: item.id })} 
    >
      <Image source={{ uri: item.picture }} style={styles.chatRoomImage} />
      <View style={styles.chatRoomDetails}>
        <Text style={styles.chatRoomTitle}>{item.title}</Text>
        <Text style={styles.chatRoomEventDate}>
          {new Date(item.eventDate).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
    
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat Rooms</Text>
      </View>

      <FlatList
        data={chatRooms}
        renderItem={renderChatRoom}
        keyExtractor={(item) => item.id.toString()}
        style={styles.chatRoomsList}
        showsVerticalScrollIndicator={false}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  header: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  chatRoomsList: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  chatRoomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  chatRoomImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  chatRoomDetails: {
    flex: 1,
  },
  chatRoomTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  chatRoomEventDate: {
    fontSize: 14,
    color: '#888',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  messageContainer: {
    marginBottom: 10,
    maxWidth: '80%',
  },
  messageSender: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
    borderRadius: 15,
    padding: 10,
    marginRight: 15,
  },
  messageReceiver: {
    alignSelf: 'flex-start',
    backgroundColor: '#ccc',
    borderRadius: 15,
    padding: 10,
    marginLeft: 15,
  },
  messageText: {
    fontSize: 14,
    color: '#fff',
  },
  senderText: {
    color: '#fff',
  },
  receiverText: {
    color: '#333',
  },
  messageTimestamp: {
    fontSize: 10,
    color: '#fff',
    marginTop: 5,
  },
  senderTimestamp: {
    color: '#fff',
  },
  receiverTimestamp: {
    color: '#555',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ChatsScreen;
