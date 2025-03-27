import { API_BASE_URL } from './config';
import { storeToken } from './token.service';

export const signIn = async (username: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to login');
    }

    await storeToken(data.AuthenticationResult.AccessToken);
    return data;
  } catch (error) {
    console.error('Login Error:', error);
    throw error;
  }
};

export const signUp = async (name: string, surname: string, age: string, email: string, password: string) => {
  try {
    const username = `${name.trim()}_${surname.trim()}`;
    const usernamePattern = /^[\p{L}\p{M}\p{S}\p{N}\p{P}]+$/u;

    if (!usernamePattern.test(username)) {
      throw new Error('Invalid username format.');
    }

    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        email,
        password,
        age: parseInt(age, 10),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to register');
    }

    return data; 
  } catch (error) {
    console.error('Signup Error:', error);
    throw error;
  }
};

export const confirmSignup = async (username: string, code: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/confirm-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, code }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to confirm signup');
      }
  
      return data;
    } catch (error) {
      console.error('Confirmation Error:', error);
      throw error;
    }
};
