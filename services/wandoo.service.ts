import { getToken } from './token.service';
import { API_BASE_URL } from './config';

export const fetchMyWandoos = async () => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/wandoos/my/wandoos`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Wandoos');
    }

    return await response.json();
  } catch (error: any) {
    throw new Error('Error fetching Wandoos: ' + error.message);
  }
};


export const fetchAddress = async (lat: number, lng: number): Promise<string> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/geo/reverse-geocode?lat=${lat}&lng=${lng}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    return data.address || 'Address not found';
  } catch (error) {
    console.error('Error fetching address:', error);
    return 'Failed to fetch address';
  }
};


export const fetchLocationCoordinates = async (address: string) => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/geo/coordinates?address=${encodeURIComponent(address)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    return data.latitude && data.longitude
      ? { latitude: data.latitude, longitude: data.longitude, address }
      : null;
  } catch (error) {
    console.error('Error fetching location coordinates:', error);
    return null;
  }
};


export const uploadImageToS3 = async (imageUri: string) => {
  const response = await fetch(imageUri);
  const blob = await response.blob();
  const formData = new FormData();
  formData.append('file', blob, 'photo.jpg');

  const token = await getToken();
  const uploadResponse = await fetch(`${API_BASE_URL}/s3/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!uploadResponse.ok) throw new Error('Failed to upload image');

  const responseData = await uploadResponse.json();
  return responseData.url;
};


export const uploadImageToS3Android = async (imageUri: string) => {
  try {
    const token = await getToken();
    if (!token) throw new Error('No auth token found');

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as any);

    const uploadResponse = await fetch(`${API_BASE_URL}/s3/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!uploadResponse.ok) throw new Error('Failed to upload image');

    const responseData = await uploadResponse.json();
    return responseData.url;
  } catch (error: any) {
    console.error('Android Image Upload Error:', error);
    throw error;
  }
};


export const saveWandoo = async (wandooData: any) => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/wandoos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(wandooData),
    });

    if (!response.ok) {
      throw new Error('Failed to create Wandoo');
    }

    return await response.json();
  } catch (error: any) {
    throw new Error('Error saving Wandoo: ' + error.message);
  }
};


export const fetchFriendsWandoos = async () => {
  const token = await getToken();
  if (!token) throw new Error('No auth token found');

  const response = await fetch(`${API_BASE_URL}/wandoos/friends/wandoos`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error('Failed to fetch Wandoos');
  return response.json();
};


export const fetchJoinedWandoos = async () => {
  const token = await getToken();
  if (!token) throw new Error('No auth token found');

  const response = await fetch(`${API_BASE_URL}/chatrooms/joined`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error('Failed to fetch joined Wandoos');
  return response.json();
};

export const joinWandoo = async (wandooId: number) => {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}/chatrooms/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ wandooId }),
  });

  if (!response.ok) throw new Error('Failed to join Wandoo');
  return response.json();
};
