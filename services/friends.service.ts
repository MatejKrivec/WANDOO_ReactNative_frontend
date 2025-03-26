// friends.service.ts
import { getToken } from './token.service';
import { API_BASE_URL } from './config';

// Fetch list of friends
export const fetchFriendships = async () => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/friends/list`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch friendships');
    }

    const friendshipData = await response.json();
    return friendshipData;
  } catch (error) {
    console.error('Error fetching friendships:', error);
    throw error;
  }
};

// Send a friend request
export const sendFriendRequest = async (userId: string) => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/friends/request/${userId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      console.log('Friend request sent');
    } else {
      throw new Error('Error sending friend request');
    }
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

// Accept a friend request
export const acceptFriendRequest = async (userId: string) => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/friends/accept/${userId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      console.log('Friend request accepted');
    } else {
      throw new Error('Error accepting friend request');
    }
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

// Remove a friend
export const removeFriend = async (userId: string) => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/friends/remove/${userId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      console.log('Friend removed');
    } else {
      throw new Error('Error removing friend');
    }
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
};
