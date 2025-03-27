import { getToken } from './token.service'; 
import { Alert } from 'react-native';
import { API_BASE_URL } from './config';

export const fetchChatRooms = async () => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/chatrooms/my`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chat rooms');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    Alert.alert('Error', 'Failed to fetch chat rooms. Please try again later.');
    return [];
  }
};

export const fetchMessages = async (chatRoomId: string) => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/chatrooms/${chatRoomId}/messages`, {
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
    return data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    Alert.alert('Error', 'Failed to fetch messages. Please try again later.');
    return [];
  }
};

export const sendMessage = async (chatRoomId: string, content: string) => {
  try {
    const token = await getToken();
    const messageData = { content };

    const response = await fetch(`${API_BASE_URL}/chatrooms/${chatRoomId}/messages`, {
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    Alert.alert('Error', 'Failed to send message. Please try again later.');
  }
};
