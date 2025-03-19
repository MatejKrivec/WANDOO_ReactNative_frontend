import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';

const WandoosScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.wandooItem}>

        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image 
            source={require('../assets/images/surfer.jpg')} 
            style={styles.profileImage} 
          />
          <Text style={styles.profileName}>Matej Krivec</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
        {Platform.OS === 'ios' && 'Hiking Adventure for iOS'}
        {Platform.OS === 'android' && 'Hiking Adventure for Android'}
        {Platform.OS === 'web' && 'Hiking Adventure for Web'}
      </Text>

        {/* Image */}
        <Image 
          source={require('../assets/images/img-krnes_smrekovec_koroska.jpg')} 
          style={styles.image} 
        />

        {/* Date */}
        <Text style={styles.date}>Date: March 20, 2025</Text>

        {/* Description */}
        <Text style={styles.description}>
          Join us for an exciting hiking adventure through the mountains. Fresh air, great views, and good company!
        </Text>

        {/* Button */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Let's do it</Text>
        </TouchableOpacity>
      </View>
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
