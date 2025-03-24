import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define route props type
type WandoosScreenRouteProp = RouteProp<RootStackParamList, 'Wandoos'>;

type Props = {
  route: WandoosScreenRouteProp;
};

const WandoosScreen: React.FC<Props> = ({ route }) => {
  const { latitude, longitude } = route.params; // Get location from navigation params
  const [wandoos, setWandoos] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<{ [key: string]: string }>({});
  const [joinedWandoos, setJoinedWandoos] = useState<number[]>([]);

  // Retrieve auth token
  const getToken = async () => await AsyncStorage.getItem('authToken');

  // Fetch Wandoos
  const fetchFriendsWandoos = async () => {
    try {
      const token = await getToken();
      if (!token) return console.error('No auth token found');

      const response = await fetch('http://localhost:3000/wandoos/friends/wandoos', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      setWandoos(data);

      // Fetch addresses
      data.forEach(async (wandoo: any) => {
        const address = await fetchAddress(wandoo.latitude, wandoo.longitude);
        setAddresses((prev) => ({ ...prev, [wandoo.id]: address }));
      });

      // Sort Wandoos by distance
      sortWandoosByDistance(data);
    } catch (error) {
      console.error('Error fetching Wandoos:', error);
    }
  };

  // Fetch joined Wandoos
  const fetchJoinedWandoos = async () => {
    try {
      const token = await getToken();
      if (!token) return console.error('No auth token found');

      const response = await fetch('http://localhost:3000/chatrooms/joined', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      setJoinedWandoos(data);
    } catch (error) {
      console.error('Error fetching joined Wandoos:', error);
    }
  };

  // Fetch address from coordinates
  const fetchAddress = async (lat: number, lng: number): Promise<string> => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/geo/reverse-geocode?lat=${lat}&lng=${lng}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      return data.address || 'Address not found';
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Failed to fetch address';
    }
  };

  // Calculate distance between two points (in km)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Sort Wandoos by distance from user
  const sortWandoosByDistance = (wandoosList: any[]) => {
    if (latitude === null || longitude === null) {
      console.error('User location is not available.');
      return;
    }

    const sortedWandoos = [...wandoosList].sort((a, b) => {
      const distanceA = calculateDistance(latitude, longitude, a.latitude, a.longitude);
      const distanceB = calculateDistance(latitude, longitude, b.latitude, b.longitude);
      return distanceA - distanceB;
    });

    setWandoos(sortedWandoos);
  };

  const onJoinWandoo = async (wandooId: number) => {
    try {
      const token = await getToken();
      if (!token) return console.error('No auth token found');

      const response = await fetch('http://localhost:3000/chatrooms/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ wandooId }),
      });

      if (!response.ok) throw new Error('Failed to join Wandoo');

      console.log('Successfully joined Wandoo');
      fetchJoinedWandoos();
    } catch (error) {
      console.error('Error joining Wandoo:', error);
    }
  };

  // Fetch data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log("The wandoo longditude and laditude: " + latitude + longitude)
      fetchFriendsWandoos();
      fetchJoinedWandoos();
    }, [])
  );

  const renderWandoo = ({ item }: any) => {
    const isJoined = joinedWandoos.includes(item.id);

    return (
      <View style={styles.wandooItem}>
        <View style={styles.profileContainer}>
          <Image source={{ uri: item.profilePicture || 'https://via.placeholder.com/40' }} style={styles.profileImage} />
          <Text style={styles.profileName}>{item.profileName || 'Unknown User'}</Text>
        </View>
        <Text style={styles.title}>{item.title || 'Untitled Event'}</Text>
        <Image source={{ uri: item.picture }} style={styles.image} />
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
      {wandoos.length === 0 ? (
        <Text style={styles.noWandoosText}>Seems like people don't Wandoo anything yet!</Text>
      ) : (
        <FlatList data={wandoos} keyExtractor={(item) => item.id.toString()} renderItem={renderWandoo} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  wandooItem: { width: '100%', borderWidth: 2, borderColor: 'black', borderRadius: 10, padding: 15, backgroundColor: 'white', marginBottom: 15, alignItems: 'center' },
  profileContainer: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 10 },
  profileImage: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  profileName: { fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  image: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
  location: { fontSize: 16, color: 'gray', marginBottom: 10 },
  description: { fontSize: 16, textAlign: 'center', marginBottom: 15 },
  button: { backgroundColor: 'green', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  disabledButton: { backgroundColor: 'lightblue' },
  noWandoosText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'gray',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default WandoosScreen;
