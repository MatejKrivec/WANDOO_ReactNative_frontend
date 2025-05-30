import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import debounce from 'lodash.debounce';
import { fetchLocationCoordinates, uploadImageToS3, saveWandoo } from '../services/wandoo.service';
import moment from 'moment-timezone';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from '../assets/styles/globalstyles';


interface AddWandooFormProps {
  visible: boolean;
  onClose: () => void;
}

interface Prediction {
  description: string;
  place_id: string;
}

const AddWandooFormWeb: React.FC<AddWandooFormProps> = ({ visible, onClose }) => {
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

  const getToken = async () => {
    return await AsyncStorage.getItem('authToken');
  };

  const fetchLocation = useCallback(
    debounce(async (text: string) => {
      if (!text) return setPredictions([]);
      setLoading(true);
      try {
        const locationData = await fetchLocationCoordinates(text);
        if (locationData) {
          setLocation(locationData);
          setPredictions([{ description: text, place_id: '' }]); 
        } else {
          setPredictions([]);
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (input) {
      fetchLocation(input);
    } else {
      setPredictions([]);
    }
  }, [input]);

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

  const handleSave = async () => {
    console.time('Add Wandoo Form submission time');

    if (!title || !date || !time || !location.address) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const token = await getToken();

      const localTime = moment.tz(`${date} ${time}`, 'YYYY-MM-DD HH:mm', 'Europe/Ljubljana');
      const eventDate = localTime.toISOString();

      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImageToS3(image);
      }

      const newWandoo = {
        picture: imageUrl || '',
        title,
        description,
        eventDate,
        latitude: location.latitude,
        longitude: location.longitude,
      };

      const createdWandoo = await saveWandoo(newWandoo);
      console.log('Wandoo created:', createdWandoo);

      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
    console.timeEnd('Add Wandoo Form submission time'); // Končaj merjenje po zaključku prijave
  }
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
          <TouchableOpacity style={[globalStyles.button, globalStyles.cancelButton]} onPress={onClose}>
            <Text style={globalStyles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[globalStyles.button, globalStyles.saveButton]} onPress={handleSave}>
            <Text style={globalStyles.buttonText}>Save</Text>
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
    width: '50%',
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
