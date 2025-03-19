import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Image, Alert, ScrollView, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';


interface AddWandooFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (wandoo: {
    title: string;
    date: Date;
    time: Date;
    description: string;
    image: string | null;
    location: { latitude: number; longitude: number; address: string };
  }) => void;
}

const  AddWandooFormAndroid: React.FC<AddWandooFormProps> = ({ visible, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string }>({
    latitude: 37.78825,
    longitude: -122.4324,
    address: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // ✅ Pick an image from gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // ✅ Save Wandoo event
  const handleSave = () => {
    if (!title || !date || !time || !location.address) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    onSave({
      title,
      date,
      time,
      description,
      image,
      location,
    });

    onClose();
  };

  // ✅ Handle map press to update location
  const handleMapPress = async (event: { nativeEvent: { coordinate: { latitude: number; longitude: number; }; }; }) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    try {
      const response = await fetch(`http://localhost:3000/geo/reverse-geocode?lat=${latitude}&lng=${longitude}`);
      const data = await response.json();
      const address = data.address;
      setLocation({
        latitude,
        longitude,
        address,
      });
    } catch (error) {
      console.error('Error fetching address:', error);
      Alert.alert('Error', 'Failed to fetch address');
    }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add a New Wandoo</Text>

          <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />

          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            <Text style={styles.imagePickerText}>{image ? 'Change Image' : 'Pick an Image'}</Text>
          </TouchableOpacity>
          {image && <Image source={{ uri: image }} style={styles.previewImage} />}

          <Text style={styles.label}>Select Date</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text style={styles.input}>{date.toDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          <Text style={styles.label}>Pick the Time</Text>
          <TouchableOpacity onPress={() => setShowTimePicker(true)}>
            <Text style={styles.input}>{time.toTimeString().slice(0, 5)}</Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) setTime(selectedTime);
              }}
            />
          )}

          <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} multiline />

        {/* {Platform.OS !== 'web' && (
              <MapView
                style={styles.map}
                region={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onPress={handleMapPress}
              >
                <Marker coordinate={location} title={location.address} />
              </MapView>
            )} */}  

          {location.address ? <Text style={styles.selectedLocation}>Selected: {location.address}</Text> : null}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20, // Adjust spacing
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  imagePicker: {
    backgroundColor: 'lightblue',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  imagePickerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  label: {
    alignSelf: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selectedLocation: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  map: {
    width: '100%',
    height: 200,
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: 'red',
  },
  saveButton: {
    backgroundColor: 'green',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AddWandooFormAndroid;