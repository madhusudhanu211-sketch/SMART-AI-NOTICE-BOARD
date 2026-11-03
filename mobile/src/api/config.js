import { Platform } from 'react-native';
import Constants from 'expo-constants';

let customHost = null;

export const setApiHost = (customIp) => {
  customHost = customIp;
};

export const getApiHost = () => {
  if (customHost) return customHost;
  try {
    // Safely query Constants only at runtime with guards
    if (Constants) {
      const hostUri =
        Constants.expoConfig?.hostUri ||
        Constants.manifest?.debuggerHost ||
        Constants.manifest2?.extra?.expoGo?.developer?.tool;
      if (hostUri) {
        const hostPart = String(hostUri).split(':')[0];
        // In tunnel mode, hostPart is an ngrok subdomain (xxxx.exp.direct) which does not forward port 8000
        if (
          hostPart &&
          !hostPart.includes('exp.direct') &&
          !hostPart.includes('ngrok') &&
          hostPart !== 'localhost' &&
          hostPart !== '127.0.0.1'
        ) {
          return hostPart;
        }
      }
    }
  } catch (e) {
    // Fallback if NativeUnimoduleProxy or Android Activity is temporarily unavailable
  }
  // Fallback to active Wi-Fi LAN IP (or Android Emulator loopback if on emulator)
  return '172.25.94.127';
};

export const API_CONFIG = {
  get BASE_URL() {
    return `http://${getApiHost()}:8000/api`;
  },
  get STATIC_URL() {
    return `http://${getApiHost()}:8000/static/uploads`;
  },
  TIMEOUT: 15000,
};
