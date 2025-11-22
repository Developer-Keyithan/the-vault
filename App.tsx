// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import { VaultProvider } from './src/context/VaultContext';
import { SecurityProvider } from './src/utils/security';
import { SecurityOverlay } from './src/components/SecurityOverlay';
import CalculatorScreen from './src/screens/CalculatorScreen';
import SetupScreen from './src/screens/SetupScreen';
import LockScreen from './src/screens/LockScreen';
import VaultHomeScreen from './src/screens/VaultHomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import BrowserScreen from './src/screens/BrowserScreen';
import FileManagerScreen from './src/screens/FileManagerScreen';
import DownloadManagerScreen from './src/screens/DownloadManagerScreen';
import GalleryScreen from './src/screens/GalleryScreen';
import RecycleBinScreen from './src/screens/RecycleBinScreen';
import VideoPlayerScreen from './src/screens/VideoPlayerScreen';
import AudioPlayerScreen from './src/screens/AudioPlayerScreen';
import ThemeScreen from './src/screens/ThemeScreen';
import WallpaperScreen from './src/screens/WallpaperScreen';

export type RootStackParamList = {
  Calculator: undefined;
  Setup: undefined;
  Lock: undefined;
  VaultHome: undefined;
  Settings: undefined;
  Browser: undefined;
  FileManager: undefined;
  DownloadManager: undefined;
  Gallery: undefined;
  RecycleBin: undefined;
  VideoPlayer: { videoId: string };
  AudioPlayer: { audioId: string };
  Theme: undefined;
  Wallpaper: undefined;
};

const Stack = createStackNavigator();

function AppContent() {
  const { lockVault } = useVault();
  const [securityAlertVisible, setSecurityAlertVisible] = React.useState(false);

  return (
    <>
      <SecurityProvider lockVault={lockVault}>
        <NavigationContainer>
          <StatusBar hidden />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Calculator" component={CalculatorScreen} />
          <Stack.Screen name="Setup" component={SetupScreen} />
          <Stack.Screen name="Lock" component={LockScreen} />
          <Stack.Screen name="VaultHome" component={VaultHomeScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Browser" component={BrowserScreen} />
          <Stack.Screen name="FileManager" component={FileManagerScreen} />
          <Stack.Screen name="DownloadManager" component={DownloadManagerScreen} />
          <Stack.Screen name="Gallery" component={GalleryScreen} />
          <Stack.Screen name="RecycleBin" component={RecycleBinScreen} />
          <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
          <Stack.Screen name="AudioPlayer" component={AudioPlayerScreen} />
          <Stack.Screen name="Theme" component={ThemeScreen} />
          <Stack.Screen name="Wallpaper" component={WallpaperScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        
        <SecurityOverlay 
          visible={securityAlertVisible}
          onClose={() => setSecurityAlertVisible(false)}
        />
      </SecurityProvider>
    </>
  );
}

export default function App() {
  return (
    <VaultProvider>
      <AppContent />
    </VaultProvider>
  );
}
