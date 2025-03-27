import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert, Platform, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { fetchCurrentUserProfile, uploadProfilePicture, updateProfilePicture, uploadProfilePictureForAndroid } from '../services/profile.service';
import globalStyles from '../assets/styles/globalstyles';

const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newProfilePic, setNewProfilePic] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userProfile = await fetchCurrentUserProfile();
        setProfile(userProfile);
      } catch (error: any) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const pickImage = async () => {
    let result;
    if (Platform.OS === 'web') {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], 
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    }

    console.log(result); 

    if (!result.canceled) {
      setNewProfilePic(result.assets[0].uri);
    }
  };

  // Upload and update profile picture Weeb
 /* const handleImageUpload = async () => {
    if (!newProfilePic) return;
    try {
      const uploadedImageUrl = await uploadProfilePicture(newProfilePic, profile?.picture);
      const updatedProfile = await updateProfilePicture(uploadedImageUrl);
      setProfile(updatedProfile);
      setNewProfilePic(null);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };*/

  const handleImageUpload = async () => {
    if (!newProfilePic) return;

    console.log("New profile pic: " + newProfilePic)
  
    try {
      let uploadedImageUrl;
      
      if (Platform.OS === 'android' || 'ios') {
        uploadedImageUrl = await uploadProfilePictureForAndroid(newProfilePic, profile?.picture);
      } else {
        uploadedImageUrl = await uploadProfilePicture(newProfilePic, profile?.picture);
      }
  
      const updatedProfile = await updateProfilePicture(uploadedImageUrl);
      setProfile(updatedProfile);
      setNewProfilePic(null);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.profileImageContainer}>
        <Image
          source={{ uri: newProfilePic || profile?.picture }}
          style={styles.profileImage}
        />
      </View>

      <View style={styles.profileDetails}>
        <Text style={styles.name}>{profile?.name || 'Unknown'}</Text>
        <Text style={styles.detail}>Age: {profile?.age || 'N/A'}</Text>
        <Text style={styles.detail}>Email: {profile?.email || 'N/A'}</Text>
      </View>

      <TouchableOpacity style={globalStyles.defaultButton} onPress={pickImage}>
        <Text style={globalStyles.buttonText}>Change Profile Picture</Text>
      </TouchableOpacity>

      {newProfilePic && (
        <TouchableOpacity style={styles.saveButton} onPress={handleImageUpload}>
          <Text style={globalStyles.buttonText}>Save New Profile Picture</Text>
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
