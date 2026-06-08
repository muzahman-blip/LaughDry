import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.laughdry.app',
  appName: 'LaughDry Kita',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
