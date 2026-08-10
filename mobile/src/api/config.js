import { Platform } from 'react-native';

// Default API Base URL: 10.0.2.2 for Android Emulator, localhost for iOS / Web, customizable LAN IP
const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

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
