import { API_BASE_URL } from './config';
import { getToken } from './token.service';

export const createProfile = async (cognitoId: string, name: string, email: string, age: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cognitoId,
        name,
        email,
        age,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create profile');
    }

    return data;
  } catch (error) {
    console.error('Profile Creation Error:', error);
    throw error;
  }
};

export const fetchCurrentUserProfile = async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
  
      const meResponse = await fetch(`${API_BASE_URL}/profiles/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!meResponse.ok) {
        throw new Error('Failed to fetch current user profile');
      }
  
      const meData = await meResponse.json();
      return meData;
    } catch (error: any) {
      console.error('Error fetching current user profile:', error);
      throw error;
    }
  };

  export const fetchAllProfiles = async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
  
      const profilesResponse = await fetch(`${API_BASE_URL}/profiles`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const profiles = await profilesResponse.json();
      return profiles;
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
      throw error;
    }
  };
  
  // Upload new profile picture
  export const uploadProfilePicture = async (imageUri: string, oldImageUrl?: string) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
  
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('file', blob, 'profile-pic.jpg');
  
      if (oldImageUrl) {
        formData.append('oldImageUrl', oldImageUrl);
      }
  
      const uploadResponse = await fetch(`${API_BASE_URL}/s3/change-profile-pic`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }
  
      const responseData = await uploadResponse.json();
      return responseData.url;
    } catch (error: any) {
      console.error('Image Upload Error:', error);
      throw error;
    }
  };
  
  // Update profile picture in backend
  export const updateProfilePicture = async (newImageUrl: string) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
  
      const response = await fetch(`${API_BASE_URL}/profiles/me/picture`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ picture: newImageUrl }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update profile picture');
      }
  
      return await response.json();
    } catch (error: any) {
      console.error('Profile Picture Update Error:', error);
      throw error;
    }
  };
