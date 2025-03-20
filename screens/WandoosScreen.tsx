import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, FlatList } from 'react-native';

const WandoosScreen: React.FC = () => {
  const [wandoos, setWandoos] = useState<any[]>([]);

  // State to store addresses of locations
  const [addresses, setAddresses] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Fetch Wandoos from the backend API
    const fetchWandoos = async () => {
      try {
        const response = await fetch('http://localhost:3000/wandoos'); // Adjust to the correct API URL
        const data = await response.json();
        setWandoos(data);

        // Fetch the address for each Wandoo's latitude and longitude
        data.forEach(async (wandoo: any) => {
          const address = await fetchAddress(wandoo.latitude, wandoo.longitude);
          setAddresses((prev) => ({
            ...prev,
            [wandoo.id]: address,
          }));
        });
      } catch (error) {
        console.error('Error fetching Wandoos:', error);
      }
    };

    fetchWandoos();
  }, []);

  // Function to fetch the address for a given latitude and longitude
  const fetchAddress = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `http://localhost:3000/geo/reverse-geocode?lat=${lat}&lng=${lng}`
      );
      const data = await response.json();
      if (data.address) {
        return data.address;
      }
      return 'Address not found';
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Failed to fetch address';
    }
  };

  // Format the date and time
  const formatDateTime = (eventDate: string) => {
    const date = new Date(eventDate);
    const formattedDate = date.toLocaleDateString(); // Format date as YYYY-MM-DD
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Format time as HH:mm
    return `${formattedDate}, time: ${formattedTime}`;
  };

  // Render each Wandoo item dynamically
  const renderWandoo = ({ item }: any) => {
    return (
      <View style={styles.wandooItem}>
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image
            source={require('../assets/images/surfer.jpg')} // Adjust profile image as needed
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>Matej Krivec</Text> {/* Adjust profile name as needed */}
        </View>

        {/* Title */}
        <Text style={styles.title}>{item.title || 'Untitled Event'}</Text>

        {/* Image */}
        <Image
          source={{ uri: item.picture }}
          style={styles.image}
        />

        {/* Date and Time */}
        <Text style={styles.date}>{formatDateTime(item.eventDate)}</Text>

        {/* Location (Formatted Address) */}
        <Text style={styles.location}>
          Location: {addresses[item.id] || 'Loading...'}
        </Text>

        {/* Description */}
        <Text style={styles.description}>{item.description}</Text>

        {/* Button */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Let's do it</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={wandoos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderWandoo}
      />
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
    marginBottom: 15, // Add space between Wandoo items
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
});

export default WandoosScreen;
