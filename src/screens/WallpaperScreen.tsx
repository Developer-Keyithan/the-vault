// src/screens/WallpaperScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Modal } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useVault } from '../context/VaultContext';

type WallpaperScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Wallpaper'>;

interface Props {
  navigation: WallpaperScreenNavigationProp;
}

const WallpaperScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedWallpaper, setSelectedWallpaper] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const { vaultState, setWallpaper } = useVault();

  const builtInWallpapers = [
    { id: 'default', name: 'Default', source: require('../assets/wallpapers/default.jpg') },
    { id: 'dark', name: 'Dark', source: require('../assets/wallpapers/dark.jpg') },
    { id: 'gradient', name: 'Gradient', source: require('../assets/wallpapers/gradient.jpg') },
    { id: 'abstract', name: 'Abstract', source: require('../assets/wallpapers/abstract.jpg') },
    { id: 'nature', name: 'Nature', source: require('../assets/wallpapers/nature.jpg') },
    { id: 'space', name: 'Space', source: require('../assets/wallpapers/space.jpg') },
  ];

  const handleWallpaperSelect = (wallpaperId: string) => {
    setWallpaper(wallpaperId);
    navigation.goBack();
  };

  const handlePreview = (wallpaperId: string) => {
    setSelectedWallpaper(wallpaperId);
    setPreviewVisible(true);
  };

  const renderWallpaperItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.wallpaperItem}
      onPress={() => handlePreview(item.id)}
      onLongPress={() => handleWallpaperSelect(item.id)}
    >
      <Image source={item.source} style={styles.wallpaperImage} />
      <Text style={styles.wallpaperName}>{item.name}</Text>
      {vaultState.currentWallpaper === item.id && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.selectedText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const currentWallpaper = builtInWallpapers.find(w => w.id === selectedWallpaper) || builtInWallpapers[0];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Built-in Wallpapers</Text>
      <FlatList
        data={builtInWallpapers}
        renderItem={renderWallpaperItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.wallpapersGrid}
      />

      <TouchableOpacity style={styles.importButton}>
        <Text style={styles.importButtonText}>Import Custom Wallpaper</Text>
      </TouchableOpacity>

      <Modal
        visible={previewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.previewContainer}>
          <Image 
            source={currentWallpaper.source} 
            style={styles.previewImage}
            resizeMode="cover"
          />
          
          <View style={styles.previewControls}>
            <TouchableOpacity 
              style={styles.previewButton}
              onPress={() => setPreviewVisible(false)}
            >
              <Text style={styles.previewButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.previewButton, styles.setButton]}
              onPress={() => {
                handleWallpaperSelect(currentWallpaper.id);
                setPreviewVisible(false);
              }}
            >
              <Text style={styles.setButtonText}>Set Wallpaper</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    padding: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  wallpapersGrid: {
    paddingBottom: 20,
  },
  wallpaperItem: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#2c2c2e',
  },
  wallpaperImage: {
    width: '100%',
    height: 120,
  },
  wallpaperName: {
    color: '#fff',
    textAlign: 'center',
    padding: 10,
    fontSize: 14,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  importButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  importButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  previewButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: 'rgba(60,60,60,0.8)',
    borderRadius: 25,
  },
  previewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  setButton: {
    backgroundColor: '#007AFF',
  },
  setButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WallpaperScreen;