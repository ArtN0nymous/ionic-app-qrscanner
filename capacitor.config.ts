import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ramsus.easyqrscanner',
  appName: 'Easy QR Scanner',
  webDir: 'www',
  plugins: {
    Filesystem: {
      iosIsDocumentPickerEnabled: true,
      androidLegacyExternalStorage: false
    }
  }
};

export default config;
