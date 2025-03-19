import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

// Path to the profile picture (surfer.jpg)
const ProfileScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Profile Picture */}
      <View style={styles.profileImageContainer}>
        <Image
          source={require('../assets/images/surfer.jpg')} // Update this path if necessary
          style={styles.profileImage}
        />
      </View>

      {/* Profile Details */}
      <View style={styles.profileDetails}>
        <Text style={styles.name}>Matej Krivec</Text>
        <Text style={styles.detail}>Age: 25</Text>
        <Text style={styles.detail}>Email: matej.krivec@example.com</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2', // Light background color
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  profileImageContainer: {
    borderRadius: 100,
    width: 150,
    height: 150,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#ddd', // Border color for the profile image
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileDetails: {
    alignItems: 'center',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  detail: {
    fontSize: 18,
    color: '#555',
    marginBottom: 5,
  },
});

export default ProfileScreen;
