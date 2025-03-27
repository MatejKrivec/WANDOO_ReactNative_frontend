import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Image, Alert, ScrollView, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import {  fetchAddress, saveWandoo,  uploadImageToS3Android } from '../services/wandoo.service';
import moment from 'moment';

interface AddWandooFormProps {
  visible: boolean;
  onClose: () => void;
}

const AddWandooFormAndroid: React.FC<AddWandooFormProps> = ({ visible, onClose }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(''); 
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string }>({
    latitude: 37.78825,
    longitude: -122.4324,
    address: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const pickImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // Fix: Use ['images'] instead of MediaTypeOptions
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    
      console.log(result); 
    
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    };

  const handleMapPress = async (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    try {
      const address = await fetchAddress(latitude, longitude);
      setLocation({ latitude, longitude, address });
    } catch (error) {
      console.error('Error fetching address:', error);
      Alert.alert('Error', 'Failed to fetch address');
    }
  };

  const handleSave = async  () => {
    if (!title || !description || !location.address) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }


    try {
  let imageUrl = null;
    if (image) {
      imageUrl =  await uploadImageToS3Android(image);
      
    }

    console.log("Date and time: " + date)

    const localTime = moment.tz(`${date} ${time}`, 'YYYY-MM-DD HH:mm', 'Europe/Ljubljana');
          const eventDate = localTime.toISOString();

    const newWandoo = {
      title,
      description,
      eventDate,
      latitude: location.latitude,
      longitude: location.longitude,
      picture: imageUrl,
    };
    console.log("New wandoo!")
    console.log(newWandoo)

    await saveWandoo(newWandoo);
    Alert.alert('Success', 'Wandoo created successfully!');
    onClose();
     
    } catch (error: any) {
      console.error('Error saving Wandoo:', error);

    const errorMessage = error?.message || 'Failed to create Wandoo';
    Alert.alert('Error', errorMessage);
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
                      <Text style={styles.input}>{date ? moment(date).format('YYYY-MM-DD') : 'Select Date'}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={date ? new Date(date) : new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) setDate(moment(selectedDate).format('YYYY-MM-DD'));
                        }}
                      />
                    )}

                    <Text style={styles.label}>Pick the Time</Text>
                    <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                      <Text style={styles.input}>{time ? time : 'Select Time'}</Text>
                    </TouchableOpacity>
                    {showTimePicker && (
                      <DateTimePicker
                        value={time ? new Date(`1970-01-01T${time}:00`) : new Date()}
                        mode="time"
                        display="default"
                        onChange={(event, selectedTime) => {
                          setShowTimePicker(false);
                          if (selectedTime) setTime(moment(selectedTime).format('HH:mm'));
                        }}
                      />
                    )}
                  

            <TextInput style={styles.inputDescription} placeholder="Description" value={description} onChangeText={setDescription} multiline />

        {/*{Platform.OS !== 'web' && (
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
              <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={() => {
                console.log("Save button pressed"); // Check if the event is being triggered
                handleSave();
              }}
            >
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
    paddingVertical: 100, // Use 100 for ios
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
  inputDescription: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    marginTop: 10,
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