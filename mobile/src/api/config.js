import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getHost = () => {
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      Constants.manifest?.debuggerHost ||
      Constants.manifest2?.extra?.expoGo?.developer?.tool;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') return ip;
    }
  } catch (e) {
    // Fallback if constants not present
  }
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
};

const DEFAULT_HOST = getHost();

export const API_CONFIG = {
  BASE_URL: `http://${DEFAULT_HOST}:8000/api`,
  STATIC_URL: `http://${DEFAULT_HOST}:8000/static/uploads`,
  TIMEOUT: 15000,
};

export const setApiHost = (customIp) => {
  if (customIp) {
    API_CONFIG.BASE_URL = `http://${customIp}:8000/api`;
    API_CONFIG.STATIC_URL = `http://${customIp}:8000/static/uploads`;
  }
};
