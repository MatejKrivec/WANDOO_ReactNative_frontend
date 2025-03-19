import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';

interface Friend {
  id: string;
  name: string;
  profilePic: any; // Use 'any' type for local image source
  status: 'friend' | 'pending' | 'add';
}

const FriendsScreen: React.FC = () => {
  const defaultProfilePic = require('../assets/images/surfer.jpg');

  const [friends, setFriends] = useState<Friend[]>([
    { id: '1', name: 'John Doe', profilePic: defaultProfilePic, status: 'friend' },
    { id: '2', name: 'Jane Smith', profilePic: defaultProfilePic, status: 'friend' },
  ]);
  const [addFriends, setAddFriends] = useState<Friend[]>([
    { id: '3', name: 'Alice Johnson', profilePic: defaultProfilePic, status: 'pending' },
    { id: '4', name: 'Bob Brown', profilePic: defaultProfilePic, status: 'add' },
  ]);
  const [search, setSearch] = useState('');

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      <Image source={item.profilePic} style={styles.profilePic} />
      <Text style={styles.friendName}>{item.name}</Text>
      {item.status === 'friend' ? (
        <TouchableOpacity style={styles.removeButton}>
          <Text style={styles.buttonText}>Remove Friend</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.pendingButton}>
          <Text style={styles.buttonText}>Pending</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAddFriendItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      <Image source={item.profilePic} style={styles.profilePic} />
      <Text style={styles.friendName}>{item.name}</Text>
      {item.status === 'add' ? (
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.buttonText}>Add Friend</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.pendingButton}>
          <Text style={styles.buttonText}>Pending</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Friends</Text>
      <FlatList
        data={friends}
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
        renderItem={renderAddFriendItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
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