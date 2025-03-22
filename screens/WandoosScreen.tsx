import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';

const WandoosScreen: React.FC = () => {
  const [wandoos, setWandoos] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<{ [key: string]: string }>({});
  const [joinedWandoos, setJoinedWandoos] = useState<number[]>([]);


  const getToken = async () => {
    return await AsyncStorage.getItem('authToken'); // Retrieve token
  };

  useEffect(() => {
    fetchFriendsWandoos();
    fetchJoinedWandoos();
  }, []);

  const fetchFriendsWandoos = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch('http://localhost:3000/wandoos/friends/wandoos', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`, // Include token in the request
        },
      });

      const data = await response.json();
      setWandoos(data);

      // Fetch addresses for each Wandoo
      data.forEach(async (wandoo: any) => {
        const address = await fetchAddress(wandoo.latitude, wandoo.longitude);
        setAddresses((prev) => ({
          ...prev,
          [wandoo.id]: address,
        }));
      });
    } catch (error) {
      console.error('Error fetching friends’ Wandoos:', error);
    }
  };

  const fetchJoinedWandoos = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.error('No auth token found');
        return;
      }
  
      const response = await fetch('http://localhost:3000/chatrooms/joined', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      setJoinedWandoos(data); // Store the list of joined Wandoo IDs
    } catch (error) {
      console.error('Error fetching joined Wandoos:', error);
    }
  };

  // Function to fetch address for a given latitude and longitude
  const fetchAddress = async (lat: number, lng: number): Promise<string> => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/geo/reverse-geocode?lat=${lat}&lng=${lng}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data.address || 'Address not found';
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Failed to fetch address';
    }
  };

  // Format date and time
  const formatDateTime = (eventDate: string) => {
    const date = new Date(eventDate);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${formattedDate}, time: ${formattedTime}`;
  };

  const onJoinWandoo = async (wandooId: number) => {
    try {
      const token = await getToken();
      if (!token) {
        console.error('No auth token found');
        return;
      }
  
      const response = await fetch('http://localhost:3000/chatrooms/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ wandooId }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to join Wandoo');
      }
  
      const data = await response.json();
      console.log('Successfully joined Wandoo:', data);
      fetchJoinedWandoos();
    } catch (error) {
      console.error('Error joining Wandoo:', error);
    }
  };

  // Render each Wandoo item
  const renderWandoo = ({ item }: any) => {
    const isJoined = joinedWandoos.includes(item.id); // Check if the Wandoo is already joined
  
    return (
      <View style={styles.wandooItem}>
        <View style={styles.profileContainer}>
          <Image source={{ uri: item.profilePicture || 'https://via.placeholder.com/40' }} style={styles.profileImage} />
          <Text style={styles.profileName}>{item.profileName || 'Unknown User'}</Text>
        </View>
  
        <Text style={styles.title}>{item.title || 'Untitled Event'}</Text>
  
        <Image source={{ uri: item.picture }} style={styles.image} />
  
        <Text style={styles.date}>{formatDateTime(item.eventDate)}</Text>
  
        <Text style={styles.location}>Location: {addresses[item.id] || 'Loading...'}</Text>
  
        <Text style={styles.description}>{item.description}</Text>
  
        {isJoined ? (
          <View style={[styles.button, styles.disabledButton]}>
            <Text style={styles.buttonText}>Joined</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.button} onPress={() => onJoinWandoo(item.id)}>
            <Text style={styles.buttonText}>Let's do it</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  

  return (
    <View style={styles.container}>
      <FlatList data={wandoos} keyExtractor={(item) => item.id.toString()} renderItem={renderWandoo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  wandooItem: {
    width: '100%',
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 10,
    padding: 15,
    backgroundColor: 'white',
    marginBottom: 15,
    alignItems: 'center',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  date: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 10,
  },
  location: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  button: {
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: 'lightblue',
  },
});

export default WandoosScreen;
