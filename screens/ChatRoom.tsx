import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type ChatRoomRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;

type Props = {
  route: ChatRoomRouteProp;
};

const ChatRoom: React.FC<Props> = ({ route }) => {
  const { title, image } = route.params;

  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'Matej Krivec',
      content: 'Hey, are we still going on the hike tomorrow?',
      timestamp: '10:30 AM',
      isSender: true,
    },
    {
      id: '2',
      sender: 'Wandoo',
      content: 'Yes, we are! Don’t forget your boots!',
      timestamp: '10:32 AM',
      isSender: false,
    },
    {
      id: '3',
      sender: 'Matej Krivec',
      content: 'Got it! I’m ready.',
      timestamp: '10:35 AM',
      isSender: true,
    },
  ]);

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: Math.random().toString(),
        sender: 'Matej Krivec',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString(),
        isSender: true,
      };
      setMessages([...messages, newMsg]);
      setNewMessage(''); // Clear the input field
    }
  };

  const renderMessage = ({ item }: { item: typeof messages[0] }) => (
    <View style={[styles.messageContainer, item.isSender ? styles.messageSender : styles.messageReceiver]}>
      <Text style={[styles.messageText, item.isSender ? styles.senderText : styles.receiverText]}>{item.content}</Text>
      <Text style={[styles.messageTimestamp, item.isSender ? styles.senderTimestamp : styles.receiverTimestamp]}>
        {item.timestamp}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={image} style={styles.headerImage} />
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        inverted
      />

      {/* Message Input Section */}
      <View style={styles.inputContainer}>
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

export default ChatRoom;
