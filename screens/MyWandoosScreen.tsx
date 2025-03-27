import React, { useState, useEffect } from 'react';
import { 
  View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Platform 
} from 'react-native';
import AddWandooFormAndroid from '../components/AddWandooFormAndroid';
import AddWandooFormWeb from '../components/AddWandooFormWeb';
import { fetchMyWandoos, fetchAddress } from '../services/wandoo.service';

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

  const fetchWandoos = async () => {
    setLoading(true);
    try {
      const wandoosData = await fetchMyWandoos();
      setWandoos(wandoosData);

      wandoosData.forEach(async (wandoo: Wandoo) => {
        const address = await fetchAddress(wandoo.latitude, wandoo.longitude);
        setAddresses((prev) => ({ ...prev, [wandoo.id]: address }));
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
      <Image source={{ uri: item.picture }} style={styles.image} />
      <Text style={styles.date}>{formatDateTime(item.eventDate)}</Text>
      <Text style={styles.location}>Location: {addresses[item.id] || 'Loading...'}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : wandoos.length === 0 ? (
        <View style={styles.noWandoosContainer}>
          <Text style={styles.noWandoosText}>No Wandoos yet, so what you wannadoo?</Text>
        </View>
      ) : (
        <FlatList
          data={wandoos}
          renderItem={renderWandooItem}
          keyExtractor={(item) => item.id.toString()}
          style={Platform.OS === 'web' ? styles.listWeb : undefined}
          ListFooterComponent={<View style={{ height: 80 }} />}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.plusSign}>+</Text>
      </TouchableOpacity>

      {Platform.OS === 'web' ? (
        <AddWandooFormWeb 
          visible={modalVisible} 
          onClose={() => {
            setModalVisible(false);
            fetchWandoos();
          }} 
        />
      ) : (
        <AddWandooFormAndroid 
          visible={modalVisible} 
          onClose={() => {
            setModalVisible(false);
            fetchWandoos();
          }} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5', 
  },
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
    alignItems: 'center',
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
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  addButton: {
    position: 'absolute',
    bottom: 25,
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
    fontSize: 20, 
    fontWeight: 'bold',
    color: 'gray',
    textAlign: 'center',
    marginTop: 50,
  },
  loadingText: {
    fontSize: 20,
    color: 'gray',
  },
});

export default MyWandoosScreen;
