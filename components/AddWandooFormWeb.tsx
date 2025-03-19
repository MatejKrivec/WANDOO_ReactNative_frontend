import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import debounce from 'lodash.debounce';
import GooglePlacesInput from './GoogleMapWeb';

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

interface Prediction {
  description: string;
  place_id: string;
}

const AddWandooFormWeb: React.FC<AddWandooFormProps> = ({ visible, onClose, onSave }) => {
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
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Debounced function to fetch location coordinates
  const fetchLocationCoordinates = useCallback(
    debounce(async (text: string) => {
      if (!text) return setPredictions([]);
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/geo/coordinates?address=${encodeURIComponent(text)}`);
        const data = await response.json();
        
        if (data.latitude && data.longitude) {
          setLocation({
            latitude: data.latitude,
            longitude: data.longitude,
            address: text, // Set address based on input text
          });
          setPredictions([{ description: text, place_id: '' }]); // Clear predictions after selection
        } else {
          setPredictions([]);
        }
      } catch (error) {
        console.error('Error fetching location coordinates:', error);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (input) {
      fetchLocationCoordinates(input);
    } else {
      setPredictions([]);
    }
  }, [input]);

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
      date: new Date(date),
      time: new Date(`1970-01-01T${time}:00`),
      description,
      image,
      location,
    });

    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add a New Wandoo</Text>

          <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />

          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            <Text style={styles.imagePickerText}>{image ? 'Change Image' : 'Pick an Image'}</Text>
          </TouchableOpacity>
          {image && <Image source={{ uri: image }} style={styles.previewImage} />}

          <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
          <TextInput style={styles.input} placeholder="Time (HH:MM)" value={time} onChangeText={setTime} />
          <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} multiline />


        {/* <GooglePlacesInput onLocationSelect={setLocation} />*/} 
          {/* Location Search */}
          <TextInput
            style={styles.input}
            placeholder="Search for a location"
            value={input}
            onChangeText={setInput}
          />
          {loading && <ActivityIndicator size="small" color="#0000ff" />}
          
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setLocation({ ...location, address: item.description })}>
                <Text style={styles.suggestion}>{item.description}</Text>
              </TouchableOpacity>
            )}
          />

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
  modalContent: {
    width: '80%',
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
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  suggestion: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectedLocation: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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

export default AddWandooFormWeb;
