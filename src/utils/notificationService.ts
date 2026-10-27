import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FCM_TOKEN_STORAGE_KEY = '@axnol_fcm_token';

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    }

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    return enabled;
  } catch {
    return false;
  }
};

export const getFcmToken = async (): Promise<string | null> => {
  try {
    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) {
      const storedToken = await AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY);
      return storedToken || null;
    }

    const token = await messaging().getToken();
    if (token) {
      await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
      return token;
    }

    const storedToken = await AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY);
    return storedToken || null;
  } catch {
    try {
      const storedToken = await AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY);
      return storedToken || null;
    } catch {
      return null;
    }
  }
};

export const getStoredFcmToken = async (): Promise<string | null> => {
  try {
    const storedToken = await AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY);
    return storedToken || null;
  } catch {
    return null;
  }
};

export const deleteFcmToken = async (): Promise<void> => {
  try {
    await messaging().deleteToken();
    await AsyncStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
  } catch {}
};
