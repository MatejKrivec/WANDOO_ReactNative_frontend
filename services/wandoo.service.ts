// wandoo.service.ts
import { getToken } from './token.service';

export const fetchMyWandoos = async () => {
  try {
    const token = await getToken();
    const response = await fetch('http://localhost:3000/wandoos/my/wandoos', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Wandoos');
    }

    return await response.json();
  } catch (error: any) {
    throw new Error('Error fetching Wandoos: ' + error.message);
  }
};

// Fetch address from latitude and longitude
export const fetchAddress = async (lat: number, lng: number): Promise<string> => {
  try {
    const token = await getToken();
    const response = await fetch(`http://localhost:3000/geo/reverse-geocode?lat=${lat}&lng=${lng}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data.address || 'Address not found';
  } catch (error) {
    console.error('Error fetching address:', error);
    return 'Failed to fetch address';
  }
};

// Geocode address to get coordinates
export const fetchLocationCoordinates = async (address: string) => {
  try {
    const token = await getToken();
    const response = await fetch(`http://localhost:3000/geo/coordinates?address=${encodeURIComponent(address)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    
    if (data.latitude && data.longitude) {
      return { latitude: data.latitude, longitude: data.longitude, address };
    }
    return null;
  } catch (error) {
    console.error('Error fetching location coordinates:', error);
    return null;
  }
};

// Upload image to S3 and return the URL
export const uploadImageToS3 = async (imageUri: string) => {
  const response = await fetch(imageUri);
  const blob = await response.blob();

  const formData = new FormData();
  formData.append('file', blob, 'photo.jpg');

  const token = await getToken();

  const uploadResponse = await fetch('http://localhost:3000/s3/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload image');
  }

  const responseData = await uploadResponse.json();
  return responseData.url;
};

// Save new Wandoo
export const saveWandoo = async (wandooData: any) => {
  try {
    const token = await getToken();

    const response = await fetch('http://localhost:3000/wandoos', {
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
  
    const response = await fetch('http://localhost:3000/wandoos/friends/wandoos', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  
    if (!response.ok) throw new Error('Failed to fetch Wandoos');
    return response.json();
  };
  
  // Fetch the joined Wandoos
  export const fetchJoinedWandoos = async () => {
    const token = await getToken();
    if (!token) throw new Error('No auth token found');
  
    const response = await fetch('http://localhost:3000/chatrooms/joined', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  
    if (!response.ok) throw new Error('Failed to fetch joined Wandoos');
    return response.json();
  };
  
  // Fetch address using coordinates (latitude, longitude)
  /*export const fetchAddress = async (lat: number, lng: number): Promise<string> => {
    const token = await getToken();
    const response = await fetch(`http://localhost:3000/geo/reverse-geocode?lat=${lat}&lng=${lng}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  
    if (!response.ok) throw new Error('Failed to fetch address');
    const data = await response.json();
    return data.address || 'Address not found';
  };*/
  
  // Join a Wandoo
  export const joinWandoo = async (wandooId: number) => {
    const token = await getToken();
    const response = await fetch('http://localhost:3000/chatrooms/join', {
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
