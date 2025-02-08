import { CapacitorConfig } from '@capacitor/cli';

const liveReloadServerConfig = process.env.CAPACITOR_LIVE_RELOAD_SERVER == null ? {} : {
  url: process.env.CAPACITOR_LIVE_RELOAD_SERVER,
  cleartext: true,
};

const config: CapacitorConfig = {
  appId: 'com.hardhacker.podwise',
  appName: 'PodwiseAI',
  webDir: 'out',
  server: {
    errorPath: '/dashboard/error',
    androidScheme: 'https',
    ...liveReloadServerConfig,
  },
  plugins: {
    // CapacitorHttp: {
    //   enabled: true,
    // },
    CapacitorCookies: {
      enabled: true,
    },
    FirebaseMessaging: {
      presentationOptions: ["sound", "alert"],
    },
  },
  ios: {
    scheme: 'PodwiseAI',
  },
};

export default config;
