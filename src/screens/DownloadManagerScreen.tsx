// src/screens/DownloadManagerScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useVault } from '../context/VaultContext';

type DownloadManagerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DownloadManager'>;

interface Props {
  navigation: DownloadManagerScreenNavigationProp;
}

const DownloadManagerScreen: React.FC<Props> = ({ navigation }) => {
  const { vaultState, updateDownload } = useVault();

  const activeDownloads = vaultState.downloads.filter(d => d.status === 'downloading' || d.status === 'paused');
  const completedDownloads = vaultState.downloads.filter(d => d.status === 'completed');

  const handlePauseResume = (downloadId: string) => {
    const download = vaultState.downloads.find(d => d.id === downloadId);
    if (download) {
      updateDownload(downloadId, {
        status: download.status === 'paused' ? 'downloading' : 'paused'
      });
    }
  };

  const handleCancel = (downloadId: string) => {
    updateDownload(downloadId, { status: 'error' });
  };

  const renderDownloadItem = ({ item }: { item: any }) => (
    <View style={styles.downloadItem}>
      <View style={styles.downloadInfo}>
        <Text style={styles.filename} numberOfLines={1}>{item.filename}</Text>
        <Text style={styles.url} numberOfLines={1}>{item.url}</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${item.progress}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{item.progress}%</Text>
        </View>

        <View style={styles.downloadStats}>
          <Text style={styles.statText}>
            {formatFileSize(item.size)} • {item.speed} KB/s
          </Text>
          <Text style={styles.statusText}>
            {item.status === 'downloading' && 'Downloading...'}
            {item.status === 'paused' && 'Paused'}
            {item.status === 'completed' && 'Completed'}
            {item.status === 'error' && 'Error'}
          </Text>
        </View>
      </View>

      <View style={styles.downloadActions}>
        {(item.status === 'downloading' || item.status === 'paused') && (
          <>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handlePauseResume(item.id)}
            >
              <Text style={styles.actionText}>
                {item.status === 'paused' ? '▶️' : '⏸️'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleCancel(item.id)}
            >
              <Text style={styles.actionText}>❌</Text>
            </TouchableOpacity>
          </>
        )}
        {item.status === 'completed' && (
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>📁</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
      <Text style={styles.sectionTitle}>Active Downloads ({activeDownloads.length})</Text>
      <FlatList
        data={activeDownloads}
        renderItem={renderDownloadItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />

      <Text style={styles.sectionTitle}>Completed Downloads ({completedDownloads.length})</Text>
      <FlatList
        data={completedDownloads}
        renderItem={renderDownloadItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
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
    marginTop: 20,
    marginBottom: 10,
  },
  list: {
    flex: 1,
  },
  downloadItem: {
    backgroundColor: '#2c2c2e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  downloadInfo: {
    flex: 1,
    marginRight: 10,
  },
  filename: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  url: {
    color: '#8e8e93',
    fontSize: 12,
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#3a3a3c',
    borderRadius: 3,
    marginRight: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressText: {
    color: '#8e8e93',
    fontSize: 12,
    minWidth: 35,
  },
  downloadStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    color: '#8e8e93',
    fontSize: 12,
  },
  statusText: {
    color: '#8e8e93',
    fontSize: 12,
  },
  downloadActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
  },
  actionText: {
    fontSize: 18,
  },
});

export default DownloadManagerScreen;