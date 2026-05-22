import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { ENDPOINTS } from './config';

// Key names for AsyncStorage
const ACCESS_TOKEN_KEY = 'homecarehub_access_token';
const REFRESH_TOKEN_KEY = 'homecarehub_refresh_token';

/**
 * Saves access and refresh JWT tokens securely in AsyncStorage
 */
export async function saveTokens(access: string, refresh: string) {
  try {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, access);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  } catch (error) {
    console.error('Error saving auth tokens:', error);
  }
}

/**
 * Clears stored JWT tokens (useful for Logout or expiration)
 */
export async function clearTokens() {
  try {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
  }
}

/**
 * Gets the current stored access token
 */
export async function getAccessToken(): Promise<string | null> {
  return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Checks if a user has a stored access token
 */
export async function isUserLoggedIn(): Promise<boolean> {
  const token = await getAccessToken();
  return !!token;
}

/**
 * Attempts to refresh the access token using the stored refresh token
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    // Call the refresh endpoint (built into simplejwt)
    const refreshUrl = ENDPOINTS.login.replace('login/', 'token/refresh/');
    const response = await fetch(refreshUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.access) {
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, data.access);
        return data.access;
      }
    }
  } catch (error) {
    console.error('Error refreshing access token:', error);
  }

  // If refresh fails, clear tokens and redirect to login
  await clearTokens();
  return null;
}

/**
 * Custom authenticated fetch wrapper that automatically appends JWT access token.
 * It also supports automatic 401 token refresh and retries!
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let token = await getAccessToken();

  // 1. Prepare headers as a plain Javascript object to avoid browser Headers object serialization bugs
  const headers: Record<string, string> = {};

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, options.headers);
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 2. Perform the request
  let response = await fetch(url, { ...options, headers });

  // 3. Handle token expiration (401 Unauthorized)
  if (response.status === 401) {
    console.log('Access token expired or unauthorized. Trying to refresh...');
    const newToken = await refreshAccessToken();

    if (newToken) {
      // Retry the original request with the fresh token
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, { ...options, headers });
    } else {
      // Refresh failed, redirect to login
      console.log('Refresh failed. Redirecting to login.');
      router.replace('/login');
    }
  }

  return response;
}
