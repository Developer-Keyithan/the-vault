// src/screens/GalleryScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Modal } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useVault } from '../context/VaultContext';

type GalleryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Gallery'>;

interface Props {
  navigation: GalleryScreenNavigationProp;
}

const GalleryScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const { vaultState, deleteFile } = useVault();

  const photos = vaultState.vaultFiles.filter(file => file.type === 'photo');

  const handleImagePress = (image: any) => {
    if (selectedImages.length > 0) {
      // Multi-select mode
      if (selectedImages.includes(image.id)) {
        setSelectedImages(selectedImages.filter(id => id !== image.id));
      } else {
        setSelectedImages([...selectedImages, image.id]);
      }
    } else {
      // Normal mode - open image viewer
      setSelectedImage(image);
      setViewerVisible(true);
    }
  };

  const handleImageLongPress = (imageId: string) => {
    setSelectedImages([imageId]);
  };

  const handleDeleteSelected = () => {
    selectedImages.forEach(imageId => deleteFile(imageId));
    setSelectedImages([]);
  };

  const renderPhotoItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.photoContainer,
        selectedImages.includes(item.id) && styles.photoSelected
      ]}
      onPress={() => handleImagePress(item)}
      onLongPress={() => handleImageLongPress(item.id)}
    >
      <Image 
        source={{ uri: item.thumbnail || item.path }} 
        style={styles.photo}
        resizeMode="cover"
      />
      {selectedImages.includes(item.id) && (
        <View style={styles.selectionIndicator}>
          <Text style={styles.selectionText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {selectedImages.length > 0 && (
        <View style={styles.selectionToolbar}>
          <Text style={styles.selectionCount}>
            {selectedImages.length} selected
          </Text>
          <TouchableOpacity onPress={handleDeleteSelected}>
            <Text style={styles.deleteButton}>🗑️ Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedImages([])}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={photos}
        renderItem={renderPhotoItem}
        keyExtractor={item => item.id}
        numColumns={3}
        style={styles.photosGrid}
      />

      <Modal
        visible={viewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setViewerVisible(false)}
      >
        <View style={styles.viewerContainer}>
          <TouchableOpacity 
            style={styles.viewerBackground}
            onPress={() => setViewerVisible(false)}
          >
            {selectedImage && (
              <Image 
                source={{ uri: selectedImage.path }} 
                style={styles.viewerImage}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
          
          <View style={styles.viewerControls}>
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlText}>❤️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlText}>↗️</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => {
                if (selectedImage) {
                  deleteFile(selectedImage.id);
                  setViewerVisible(false);
                }
              }}
            >
              <Text style={styles.controlText}>🗑️</Text>
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
  },
  selectionToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2c2c2e',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3c',
  },
  selectionCount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  photosGrid: {
    flex: 1,
    padding: 5,
  },
  photoContainer: {
    flex: 1,
    aspectRatio: 1,
    margin: 2,
    borderRadius: 5,
    overflow: 'hidden',
  },
  photoSelected: {
    opacity: 0.7,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  selectionIndicator: {
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
  selectionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  viewerBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerImage: {
    width: '100%',
    height: '100%',
  },
  viewerControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 50,
  },
  controlButton: {
    padding: 15,
    backgroundColor: 'rgba(60,60,60,0.8)',
    borderRadius: 25,
  },
  controlText: {
    fontSize: 20,
  },
});

export default GalleryScreen;