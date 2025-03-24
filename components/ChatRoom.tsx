import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

type ChatRoomRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;

type Props = {
  route: ChatRoomRouteProp;
};

const ChatRoom: React.FC<Props> = ({ route }) => {
  const { title, image, id } = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const { height } = Dimensions.get('window'); // Get screen height

  const getToken = async () => {
    return Platform.OS === 'web'
      ? await AsyncStorage.getItem('authToken')
      : await SecureStore.getItemAsync('authToken');
  };

  const fetchMessages = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/chatrooms/${id}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);

      // Scroll to the bottom after messages are fetched
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [id]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const token = await getToken();
        const messageData = {
          content: newMessage,
        };

        const response = await fetch(`http://localhost:3000/chatrooms/${id}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        fetchMessages();

        // Scroll to the bottom when a new message is added
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const renderMessage = ({ item }: { item: typeof messages[0] }) => (
    <View style={[styles.messageContainer, item.type === 'my' ? styles.messageSender : styles.messageReceiver]}>
      <Image source={{ uri: item.picture }} style={styles.messageImage} />
      <View style={styles.messageContent}>
        <Text style={styles.messageName}>{item.name}</Text>
        <Text style={[styles.messageText, item.type === 'my' ? styles.senderText : styles.receiverText]}>
          {item.content}
        </Text>
        <Text style={[styles.messageTimestamp, item.type === 'my' ? styles.senderTimestamp : styles.receiverTimestamp]}>
          {item.timestamp}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={[styles.header, { height: height * 0.1 }]}>
        <Image source={image} style={styles.headerImage} />
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      {/* Scrollable Messages */}
      <View style={[styles.messagesContainer, { height: height * 0.73 }]}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      </View>

      {/* Message Input Section */}
      <View style={[styles.inputContainer, { height: height * 0.1 }]}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message"
          style={styles.textInput}
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  messagesContainer: {
    overflow: 'hidden', // Prevent overflow
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  messageContainer: {
    flexDirection: 'row',
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
  messageContent: {
    marginLeft: 10,
  },
  messageImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  messageName: {
    fontSize: 12,
    fontWeight: 'bold',
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

export default ChatRoom;