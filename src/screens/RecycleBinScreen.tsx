// src/screens/RecycleBinScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useVault } from '../context/VaultContext';

type RecycleBinScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RecycleBin'>;

interface Props {
  navigation: RecycleBinScreenNavigationProp;
}

const RecycleBinScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const { vaultState, restoreFile, deleteFile } = useVault();

  const handleRestore = (fileId: string) => {
    restoreFile(fileId);
  };

  const handlePermanentDelete = (fileId: string) => {
    Alert.alert(
      'Permanent Delete',
      'This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Permanently', 
          style: 'destructive',
          onPress: () => deleteFile(fileId, true)
        }
      ]
    );
  };

  const handleRestoreAll = () => {
    vaultState.recycleBin.forEach(file => restoreFile(file.id));
  };

  const handleEmptyBin = () => {
    Alert.alert(
      'Empty Recycle Bin',
      'This will permanently delete all items. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Empty Bin', 
          style: 'destructive',
          onPress: () => {
            vaultState.recycleBin.forEach(file => deleteFile(file.id, true));
          }
        }
      ]
    );
  };

  const getTimeRemaining = (deletedAt: Date): string => {
    const daysToKeep = 30;
    const deletedTime = new Date(deletedAt).getTime();
    const currentTime = new Date().getTime();
    const timeRemaining = deletedTime + (daysToKeep * 24 * 60 * 60 * 1000) - currentTime;
    
    if (timeRemaining <= 0) return 'Expired';
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    return `${days} days`;
  };

  const renderBinItem = ({ item }: { item: any }) => (
    <View style={styles.binItem}>
      <View style={styles.fileInfo}>
        <Text style={styles.fileIcon}>
          {item.type === 'photo' && '🖼️'}
          {item.type === 'video' && '🎬'}
          {item.type === 'audio' && '🎵'}
          {item.type === 'document' && '📄'}
          {item.type === 'zip' && '📦'}
        </Text>
        <View style={styles.fileDetails}>
          <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.fileMeta}>
            Deleted • {getTimeRemaining(item.deletedAt)} remaining
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleRestore(item.id)}
        >
          <Text style={styles.restoreText}>↶</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handlePermanentDelete(item.id)}
        >
          <Text style={styles.deleteText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Recycle Bin ({vaultState.recycleBin.length})
        </Text>
        
        {vaultState.recycleBin.length > 0 && (
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleRestoreAll}>
              <Text style={styles.headerButton}>Restore All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEmptyBin}>
              <Text style={[styles.headerButton, styles.emptyButton]}>Empty Bin</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {vaultState.recycleBin.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🗑️</Text>
          <Text style={styles.emptyText}>Recycle Bin is Empty</Text>
          <Text style={styles.emptySubtext}>
            Deleted files will appear here and be automatically removed after 30 days
          </Text>
        </View>
      ) : (
        <FlatList
          data={vaultState.recycleBin}
          renderItem={renderBinItem}
          keyExtractor={item => item.id}
          style={styles.binList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2c2c2e',
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3c',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 15,
    fontWeight: 'bold',
  },
  emptyButton: {
    color: '#ff3b30',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#8e8e93',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  binList: {
    flex: 1,
    padding: 15,
  },
  binItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2c2c2e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  fileMeta: {
    color: '#8e8e93',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 10,
    marginLeft: 10,
  },
  restoreText: {
    color: '#34C759',
    fontSize: 20,
  },
  deleteText: {
    color: '#ff3b30',
    fontSize: 18,
  },
});

export default RecycleBinScreen;