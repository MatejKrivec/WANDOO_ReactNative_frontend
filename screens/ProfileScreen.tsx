import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert, Platform, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newProfilePic, setNewProfilePic] = useState<string | null>(null);  // New state to store temporary profile pic

  const getToken = async () => {
    return Platform.OS === 'web'
      ? await AsyncStorage.getItem('authToken')
      : await SecureStore.getItemAsync('authToken');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error('No auth token found');

        const response = await fetch('http://localhost:3000/profiles/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch profile');

        setProfile(data);
      } catch (error: any) {
        console.error('Profile Fetch Error:', error);
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Open image picker to select a new image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setNewProfilePic(result.assets[0].uri);  // Temporarily set the selected image to state
    }
  };

  // Upload the image to S3 and update the profile picture in backend
  const handleImageUpload = async (imageUri: string) => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('file', blob, 'profile-pic.jpg');  // Add the file correctly to FormData
    
    // Include the old image URL in FormData (this is the key expected in the backend)
    const oldImageUrl = profile?.picture || '';  // Default to empty string if there's no current picture
    formData.append('oldImageUrl', oldImageUrl);  // Add old image URL to FormData
    
    const uploadResponse = await fetch('http://localhost:3000/s3/change-profile-pic', {
      method: 'POST',
      body: formData,  // Send the FormData as the body
      headers: {
    // Send the token for authentication
      },
    });
  
    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image');
    }
  
    const responseData = await uploadResponse.json();
    const uploadedImageUrl = responseData.url;
  
    await updateProfilePic(uploadedImageUrl);  // Update profile pic in the backend
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
};

  // Update the profile picture URL in the backend
  const updateProfilePic = async (newImageUrl: string) => {
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:3000/profiles/me/picture', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          picture: newImageUrl,  // Sending the new image URL to update the profile picture
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile picture');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);  // Update profile data with the new picture URL
      setNewProfilePic(null);  // Reset the temporary profile picture URI
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  // If loading, show a loading indicator
  if (loading) return <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.profileImageContainer}>
        <Image
          source={{ uri: newProfilePic || profile?.picture }} // Use newProfilePic if available, else fallback to profile.picture
          style={styles.profileImage}
        />
      </View>

      <View style={styles.profileDetails}>
        <Text style={styles.name}>{profile?.name || 'Unknown'}</Text>
        <Text style={styles.detail}>Age: {profile?.age || 'N/A'}</Text>
        <Text style={styles.detail}>Email: {profile?.email || 'N/A'}</Text>
      </View>

      {/* Button to select a new profile picture */}
      <TouchableOpacity style={styles.changePicButton} onPress={pickImage}>
        <Text style={styles.changePicText}>Change Profile Picture</Text>
      </TouchableOpacity>

      {/* Button to confirm the new profile picture and upload it */}
      {newProfilePic && (
        <TouchableOpacity style={styles.saveButton} onPress={() => handleImageUpload(newProfilePic)}>
          <Text style={styles.saveButtonText}>Save New Profile Picture</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2', alignItems: 'center', justifyContent: 'center', padding: 20 },
  profileImageContainer: { borderRadius: 100, width: 150, height: 150, overflow: 'hidden', marginBottom: 20, borderWidth: 3, borderColor: '#ddd' },
  profileImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  profileDetails: { alignItems: 'center' },
  name: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  detail: { fontSize: 18, color: '#555', marginBottom: 5 },
  changePicButton: { marginTop: 20, padding: 10, backgroundColor: '#0066cc', borderRadius: 5 },
  changePicText: { color: 'white', fontWeight: 'bold' },
  saveButton: { marginTop: 20, padding: 10, backgroundColor: '#28a745', borderRadius: 5 },
  saveButtonText: { color: 'white', fontWeight: 'bold' },
});

export default ProfileScreen;
