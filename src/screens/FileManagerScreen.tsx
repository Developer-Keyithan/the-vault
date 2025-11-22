// src/screens/FileManagerScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useVault } from '../context/VaultContext';
import { useVaultFiles } from '../services/useVaultFiles';

type FileManagerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FileManager'>;

interface Props {
  navigation: FileManagerScreenNavigationProp;
}

const FileManagerScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const { vaultState, addFile, deleteFile } = useVault();
  const { organizeFilesByType } = useVaultFiles();

  const categories = [
    { id: 'all', name: 'All', icon: '📁' },
    { id: 'photos', name: 'Photos', icon: '🖼️' },
    { id: 'videos', name: 'Videos', icon: '🎬' },
    { id: 'audio', name: 'Audio', icon: '🎵' },
    { id: 'documents', name: 'Documents', icon: '📄' },
    { id: 'zips', name: 'Zips', icon: '📦' },
    { id: 'notes', name: 'Notes', icon: '📝' },
    { id: 'passwords', name: 'Passwords', icon: '🔐' },
  ];

  const organizedFiles = organizeFilesByType(vaultState.vaultFiles);
  const currentFiles = organizedFiles[selectedCategory as keyof typeof organizedFiles] || [];

  const handleFilePress = (fileId: string) => {
    if (selectedFiles.length > 0) {
      // Multi-select mode
      if (selectedFiles.includes(fileId)) {
        setSelectedFiles(selectedFiles.filter(id => id !== fileId));
      } else {
        setSelectedFiles([...selectedFiles, fileId]);
      }
    } else {
      // Normal mode - open file
      const file = vaultState.vaultFiles.find(f => f.id === fileId);
      if (file) {
        if (file.type === 'photo' || file.type === 'video') {
          navigation.navigate('Gallery');
        }
      }
    }
  };

  const handleFileLongPress = (fileId: string) => {
    setSelectedFiles([fileId]);
  };

  const handleDeleteSelected = () => {
    selectedFiles.forEach(fileId => deleteFile(fileId));
    setSelectedFiles([]);
  };

  const handleImport = () => {
    // TODO: Implement file import from device storage
  };

  const renderFileGrid = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.fileItem,
        viewMode === 'grid' ? styles.fileGrid : styles.fileList,
        selectedFiles.includes(item.id) && styles.fileSelected
      ]}
      onPress={() => handleFilePress(item.id)}
      onLongPress={() => handleFileLongPress(item.id)}
    >
      <Text style={styles.fileIcon}>
        {item.type === 'photo' && '🖼️'}
        {item.type === 'video' && '🎬'}
        {item.type === 'audio' && '🎵'}
        {item.type === 'document' && '📄'}
        {item.type === 'zip' && '📦'}
        {item.type === 'note' && '📝'}
        {item.type === 'password' && '🔐'}
      </Text>
      <Text style={styles.fileName} numberOfLines={1}>
        {item.name}
      </Text>
      {viewMode === 'list' && (
        <Text style={styles.fileSize}>
          {formatFileSize(item.size)}
        </Text>
      )}
    </TouchableOpacity>
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.category,
              selectedCategory === category.id && styles.categorySelected
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.toolbar}>
        <TouchableOpacity onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
          <Text style={styles.toolbarButton}>
            {viewMode === 'grid' ? '☷ List' : '☰ Grid'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleImport}>
          <Text style={styles.toolbarButton}>📥 Import</Text>
        </TouchableOpacity>

        {selectedFiles.length > 0 && (
          <TouchableOpacity onPress={handleDeleteSelected}>
            <Text style={[styles.toolbarButton, styles.deleteButton]}>
              🗑️ Delete ({selectedFiles.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={currentFiles}
        renderItem={renderFileGrid}
        key={viewMode}
        keyExtractor={item => item.id}
        numColumns={viewMode === 'grid' ? 3 : 1}
        style={styles.fileList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  categories: {
    backgroundColor: '#2c2c2e',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  category: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginRight: 10,
    borderRadius: 15,
    backgroundColor: '#3a3a3c',
  },
  categorySelected: {
    backgroundColor: '#007AFF',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  categoryName: {
    color: '#fff',
    fontSize: 12,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#2c2c2e',
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3c',
  },
  toolbarButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    color: '#ff3b30',
  },
  fileList: {
    flex: 1,
    padding: 10,
  },
  fileItem: {
    backgroundColor: '#2c2c2e',
    margin: 5,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  fileGrid: {
    width: 100,
  },
  fileList: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileSelected: {
    backgroundColor: '#007AFF',
  },
  fileIcon: {
    fontSize: 30,
    marginBottom: 5,
  },
  fileName: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  fileSize: {
    color: '#8e8e93',
    fontSize: 11,
  },
});

export default FileManagerScreen;