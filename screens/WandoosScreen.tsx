import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Platform } from 'react-native';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { fetchFriendsWandoos, fetchJoinedWandoos, fetchAddress, joinWandoo } from '../services/wandoo.service';
import globalStyles from '../assets/styles/globalstyles';

type WandoosScreenRouteProp = RouteProp<RootStackParamList, 'Wandoos'>;

type Props = {
  route: WandoosScreenRouteProp;
};

const WandoosScreen: React.FC<Props> = ({ route }) => {
  const { latitude, longitude } = route.params; 
  const [wandoos, setWandoos] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<{ [key: string]: string }>({});
  const [joinedWandoos, setJoinedWandoos] = useState<number[]>([]);

  const fetchWandoosData = async () => {
    try {
      const wandoosData = await fetchFriendsWandoos();
      setWandoos(wandoosData);

      wandoosData.forEach(async (wandoo: any) => {
        const address = await fetchAddress(wandoo.latitude, wandoo.longitude);
        setAddresses((prev) => ({ ...prev, [wandoo.id]: address }));
      });

      sortWandoosByDistance(wandoosData);
    } catch (error) {
      console.error('Error fetching Wandoos:', error);
    }
  };

  const fetchJoinedData = async () => {
    try {
      const joined = await fetchJoinedWandoos();
      setJoinedWandoos(joined);
    } catch (error) {
      console.error('Error fetching joined Wandoos:', error);
    }
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

  const onJoinWandoo = async (wandooId: number) => {
    try {
      await joinWandoo(wandooId);
      console.log('Successfully joined Wandoo');
      fetchJoinedData();
    } catch (error) {
      console.error('Error joining Wandoo:', error);
    }
  };

  const formatDateTime = (eventDate: string) => {
    const date = new Date(eventDate);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${formattedDate}, time: ${formattedTime}`;
  };

  useFocusEffect(
    useCallback(() => {
      console.log("The wandoo longitude and latitude: " + latitude + ", " + longitude);
      fetchWandoosData();
      fetchJoinedData();
    }, [])
  );

  const renderWandoo = ({ item }: any) => {
    const isJoined = joinedWandoos.includes(item.id);

    return (
      <View style={globalStyles.wandooItem}>
        <View style={styles.profileContainer}>
          <Image source={{ uri: item.profilePicture || 'https://via.placeholder.com/40' }} style={styles.profileImage} />
          <Text style={styles.profileName}>{item.profileName || 'Unknown User'}</Text>
        </View>
        <Text style={globalStyles.title}>{item.title || 'Untitled Event'}</Text>
        <Image source={{ uri: item.picture }} style={styles.image} />
        <Text style={globalStyles.date}>{formatDateTime(item.eventDate)}</Text>
        <Text style={globalStyles.location}>Location: {addresses[item.id] || 'Loading...'}</Text>
        <Text style={globalStyles.description}>{item.description}</Text>
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
        <FlatList 
         data={wandoos} 
         style={Platform.OS === 'web' ? styles.listWeb : undefined}
         keyExtractor={(item) => item.id.toString()} 
         renderItem={renderWandoo} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  listWeb: {
    width: '65%',
  },
  wandooItem: { 
    width: '100%', 
    borderWidth: 2, 
    borderColor: 'black', 
    borderRadius: 10, 
    padding: 15, 
    backgroundColor: 'white', 
    marginBottom: 15, 
    alignItems: 'center' 
  },
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
