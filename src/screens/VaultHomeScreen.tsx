// src/screens/VaultHomeScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ImageBackground, Dimensions, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useVault } from '../context/VaultContext';
import AppIcon from '../components/AppIcon';

type VaultHomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VaultHome'>;

interface Props {
  navigation: VaultHomeScreenNavigationProp;
}

interface App {
  id: string;
  name: string;
  icon: string;
  screen: keyof RootStackParamList;
  color: string;
}

const VaultHomeScreen: React.FC<Props> = ({ navigation }) => {
  const [jiggleMode, setJiggleMode] = useState(false);
  const [apps, setApps] = useState<App[]>([
    { id: '1', name: 'Settings', icon: '⚙️', screen: 'Settings', color: '#8E8E93' },
    { id: '2', name: 'Browser', icon: '🌐', screen: 'Browser', color: '#007AFF' },
    { id: '3', name: 'Files', icon: '📁', screen: 'FileManager', color: '#FF9500' },
    { id: '4', name: 'Downloads', icon: '📥', screen: 'DownloadManager', color: '#34C759' },
    { id: '5', name: 'Gallery', icon: '🖼️', screen: 'Gallery', color: '#FF2D55' },
    { id: '6', name: 'Recycle Bin', icon: '🗑️', screen: 'RecycleBin', color: '#FF3B30' },
    { id: '7', name: 'Video Player', icon: '🎬', screen: 'VideoPlayer', color: '#5856D6' },
    { id: '8', name: 'Audio Player', icon: '🎵', screen: 'AudioPlayer', color: '#AF52DE' },
    { id: '9', name: 'Theme', icon: '🎨', screen: 'Theme', color: '#FFCC00' },
    { id: '10', name: 'Wallpaper', icon: '🖼️', screen: 'Wallpaper', color: '#5AC8FA' },
  ]);

  const { vaultState, lockVault } = useVault();

  const handleAppPress = useCallback((app: App) => {
    if (jiggleMode) return;
    
    if (app.screen === 'VideoPlayer' || app.screen === 'AudioPlayer') {
      Alert.alert('Coming Soon', 'This feature will be available in the next update');
      return;
    }
    
    navigation.navigate(app.screen);
  }, [jiggleMode, navigation]);

  const handleAppLongPress = useCallback(() => {
    setJiggleMode(true);
  }, []);

  const handleRearrange = useCallback((fromIndex: number, toIndex: number) => {
    const newApps = [...apps];
    const [movedApp] = newApps.splice(fromIndex, 1);
    newApps.splice(toIndex, 0, movedApp);
    setApps(newApps);
  }, [apps]);

  const handleBackgroundPress = useCallback(() => {
    if (jiggleMode) {
      setJiggleMode(false);
    }
  }, [jiggleMode]);

  const getWallpaperSource = () => {
    // TODO: Load actual wallpaper based on vaultState.currentWallpaper
    return require('../assets/wallpapers/default.jpg');
  };

  return (
    <ImageBackground 
      source={getWallpaperSource()} 
      style={styles.background}
      blurRadius={vaultState.currentTheme.blurIntensity}
    >
      <TouchableOpacity 
        style={styles.container} 
        activeOpacity={1}
        onPress={handleBackgroundPress}
      >
        <View style={styles.appGrid}>
          {apps.map((app, index) => (
            <AppIcon
              key={app.id}
              app={app}
              index={index}
              jiggleMode={jiggleMode}
              onPress={handleAppPress}
              onLongPress={handleAppLongPress}
              onRearrange={handleRearrange}
            />
          ))}
        </View>
      </TouchableOpacity>
    </ImageBackground>
  );
};

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  appGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

// Add missing import
import { TouchableOpacity } from 'react-native-gesture-handler';

export default VaultHomeScreen;