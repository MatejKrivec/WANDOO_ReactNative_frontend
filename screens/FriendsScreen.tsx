import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Friend {
  id: string;
  name: string;
  profilePic: any; // Use 'any' type for local image source
  status: 'friend' | 'pending' | 'add' | 'accept'; // 'friend', 'pending', 'add' will be used for statuses
}

const FriendsScreen: React.FC = () => {
  const [allProfiles, setAllProfiles] = useState<Friend[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<Friend[]>([]);
  const [addFriends, setAddFriends] = useState<Friend[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const defaultProfilePic = require('../assets/images/surfer.jpg');

  const getToken = async () => {
    return Platform.OS === 'web'
      ? await AsyncStorage.getItem('authToken')
      : await SecureStore.getItemAsync('authToken');
  };

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const meResponse = await fetch('http://localhost:3000/profiles/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!meResponse.ok) {
        throw new Error('Failed to fetch current user profile');
      }
  
      const meData = await meResponse.json();
      const currentUserCognitoId = meData.cognitoId;
  
      const profilesResponse = await fetch('http://localhost:3000/profiles', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const profiles = await profilesResponse.json();
      console.log("Profiles:", profiles);
  
      const friendshipResponse = await fetch('http://localhost:3000/friends/list', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const friendshipData = await friendshipResponse.json();
      console.log("Friendships:", friendshipData);
  
      const sortedProfiles = profiles.map((profile: any) => {
        console.log("Current user cognito id: " + currentUserCognitoId);
        if (profile.cognitoId === currentUserCognitoId) return null;
  
        const friendship = friendshipData.find((f: any) =>
          (f.userId1 === profile.cognitoId || f.userId2 === profile.cognitoId) &&
          (f.userId1 === currentUserCognitoId || f.userId2 === currentUserCognitoId)
        );
  
        let status: 'friend' | 'pending' | 'add' | 'accept' = 'add';
  
        if (friendship) {
          if (friendship.status === 'ACCEPTED') {
            status = 'friend';
          } else if (friendship.status === 'PENDING') {
            // Check if the current user is the recipient of the friend request
            status = friendship.userId2 === currentUserCognitoId ? 'accept' : 'pending';
          }
        }
  
        return {
          id: profile.cognitoId,
          name: profile.name,
          profilePic: profile.picture ? { uri: profile.picture } : defaultProfilePic,
          status,
        };
      }).filter((profile: any) => profile !== null);
  
      console.log("Sorted Profiles:", sortedProfiles);
  
      setFriends(sortedProfiles.filter((profile: { status: string; }) => profile.status === 'friend'));
      setPending(sortedProfiles.filter((profile: { status: string; }) => profile.status === 'pending' || profile.status === 'accept'));
      setAddFriends(sortedProfiles.filter((profile: { status: string; }) => profile.status === 'add'));
      setAllProfiles(sortedProfiles);
    } catch (error) {
      console.error('Error fetching profiles or friendship data', error);
      alert('Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleSendFriendRequest = async (userId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/friends/request/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log('Friend request sent');
        fetchProfiles(); // Re-fetch profiles to update the state
      } else {
        console.error('Error sending friend request');
      }
    } catch (error) {
      console.error('Error sending friend request', error);
    }
  };

  const handleAcceptFriendRequest = async (userId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/friends/accept/${userId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log('Friend request accepted');
        fetchProfiles(); // Re-fetch profiles to update the state
      } else {
        console.error('Error accepting friend request');
      }
    } catch (error) {
      console.error('Error accepting friend request', error);
    }
  };

  const handleRemoveFriend = async (userId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/friends/remove/${userId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log('Friend removed');
        fetchProfiles(); // Re-fetch profiles to update the state
      } else {
        console.error('Error removing friend');
      }
    } catch (error) {
      console.error('Error removing friend', error);
    }
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      <Image source={item.profilePic} style={styles.profilePic} />
      <Text style={styles.friendName}>{item.name}</Text>
      {item.status === 'friend' ? (
        <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveFriend(item.id)}>
          <Text style={styles.buttonText}>Remove Friend</Text>
        </TouchableOpacity>
      ) : item.status === 'pending' ? (
        <TouchableOpacity style={styles.pendingButton}>
          <Text style={styles.buttonText}>Pending</Text>
        </TouchableOpacity>
      ) : item.status === 'accept' ? (
        <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptFriendRequest(item.id)}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.addButton} onPress={() => handleSendFriendRequest(item.id)}>
          <Text style={styles.buttonText}>Add Friend</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Friends</Text>
          <FlatList
            data={friends}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
          />

          <Text style={styles.sectionTitle}>Pending Requests</Text>
          <FlatList
            data={pending}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
          />

          <Text style={styles.sectionTitle}>Add Friends</Text>
          <TextInput
            style={styles.searchBar}
            placeholder="Search for friends..."
            value={search}
            onChangeText={setSearch}
          />
          <FlatList
            data={addFriends}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  list: {
    marginBottom: 20,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  friendName: {
    flex: 1,
    fontSize: 18,
  },
  addButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
  },
  acceptButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
  },
  removeButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  pendingButton: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  searchBar: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default FriendsScreen;
