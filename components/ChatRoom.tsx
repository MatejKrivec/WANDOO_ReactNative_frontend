import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, Image, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Dimensions, Alert 
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { sendMessage, fetchMessages } from '../services/chatroom.service';

type ChatRoomRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;

type Props = {
  route: ChatRoomRouteProp;
};

const ChatRoom: React.FC<Props> = ({ route }) => {
  const { title, image, id } = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const { height } = Dimensions.get('window'); // Get screen height

  const loadMessages = async () => {
    try {
      const loadedMessages = await fetchMessages(id);
      setMessages(loadedMessages);

      // Scroll to the bottom after messages are fetched
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [id]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const data = await sendMessage(id, newMessage);
        if (data) {
          setNewMessage(''); 
          loadMessages(); 
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        Alert.alert('Error', 'Failed to send message. Please try again later.');
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
    <View>
      {/* Header */}
      <View style={[styles.header, { height: height * 0.08 }]}>
        <Image source={{ uri: image }} style={styles.headerImage} />
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      {/* Scrollable Messages  --->  Fix  this for iphone */}
      <View style={[styles.messagesContainer, { 
  height: Platform.OS === 'web' ? height * 0.7 : isTyping ? (Platform.OS === 'ios' ? height * 0.4 : height * 0.3) : height * 0.7 
}]}>
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
          onFocus={() => setIsTyping(true)}
          onBlur={() => setIsTyping(false)}
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    overflow: 'hidden', 
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