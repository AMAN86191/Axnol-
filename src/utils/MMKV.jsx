import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

// Required for zustand persist
export const zustandStorage = {
  getItem: (name) => {
    const value = storage.getString(name);
    return value ? JSON.parse(value) : null; // Parse string back to object
  },
  setItem: (name, value) => {
    storage.set(name, JSON.stringify(value)); // Always store as string
  },
  removeItem: (name) => {
    storage.delete(name);
  },
};

