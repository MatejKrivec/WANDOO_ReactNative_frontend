import React, { useState, useEffect } from 'react';
import { 
  View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Platform 
} from 'react-native';
import AddWandooFormAndroid from '../components/AddWandooFormAndroid';
import AddWandooFormWeb from '../components/AddWandooFormWeb';
import { fetchMyWandoos, fetchAddress } from '../services/wandoo.service'; // Import from wandoo.service

interface Wandoo {
  id: number;
  title: string;
  description: string;
  postedAt: string;
  eventDate: string;
  profileId: string;
  picture: string;
  latitude: number;
  longitude: number;
}

const MyWandoosScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [wandoos, setWandoos] = useState<Wandoo[]>([]);
  const [addresses, setAddresses] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  const formatDateTime = (eventDate: string) => {
    const date = new Date(eventDate);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${formattedDate}, time: ${formattedTime}`;
  };

  useEffect(() => {
    fetchWandoos();
  }, []);

  // Fetch Wandoos and addresses
  const fetchWandoos = async () => {
    setLoading(true);
    try {
      const wandoosData = await fetchMyWandoos(); // Get the Wandoos data
      setWandoos(wandoosData);

      // Fetch the address for each Wandoo's latitude and longitude
      wandoosData.forEach(async (wandoo: Wandoo) => {
        const address = await fetchAddress(wandoo.latitude, wandoo.longitude);
        setAddresses((prev) => ({
          ...prev,
          [wandoo.id]: address,
        }));
      });
    } catch (error) {
      console.error('Error fetching Wandoos', error);
      alert('Failed to fetch Wandoos. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderWandooItem = ({ item }: { item: Wandoo }) => (
    <View style={styles.wandooItem}>
      <Text style={styles.title}>{item.title}</Text>
      <Image 
        source={{ uri: item.picture }} 
        style={styles.image} 
      />
      <Text style={styles.date}>{formatDateTime(item.eventDate)}</Text>
      <Text style={styles.location}>Location: {addresses[item.id] || 'Loading...'}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : wandoos.length === 0 ? (
        <View style={styles.noWandoosContainer}>
          <Text style={styles.noWandoosText}>No Wandoos yet, so what you wannadoo?</Text>
        </View>
      ) : (
        <FlatList
          data={wandoos}
          renderItem={renderWandooItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.plusSign}>+</Text>
      </TouchableOpacity>

      {/* Add Wandoo Modal */}
      {Platform.OS === 'web' ? (
        <AddWandooFormWeb 
          visible={modalVisible} 
          onClose={() => {
            setModalVisible(false);
            fetchWandoos(); // Refresh the list after closing the modal
          }} 
        />
      ) : (
        <AddWandooFormAndroid 
          visible={modalVisible} 
          onClose={() => {
            setModalVisible(false);
            fetchWandoos(); // Refresh the list after closing the modal
          }} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  list: {
    width: '100%',
    paddingBottom: 100, // Add padding to the bottom to account for the add button
  },
  wandooItem: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    padding: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    marginBottom: 20,
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
    fontWeight: '600',
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'lightblue',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  plusSign: {
    fontSize: 40,
    color: 'white',
  },
  noWandoosContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  noWandoosText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'gray',
    textAlign: 'center',
  },
});

export default MyWandoosScreen;
