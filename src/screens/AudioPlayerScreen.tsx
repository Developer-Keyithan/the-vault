// src/screens/AudioPlayerScreen.tsx
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Audio } from 'expo-av';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useVault } from '../context/VaultContext';

type AudioPlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AudioPlayer'>;

interface Props {
  navigation: AudioPlayerScreenNavigationProp;
  route: any;
}

const AudioPlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  const soundRef = useRef<Audio.Sound>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(0);
  const { vaultState } = useVault();

  const audioFiles = vaultState.vaultFiles.filter(file => file.type === 'audio');

  useEffect(() => {
    if (audioFiles.length > 0) {
      loadAudio(currentTrack);
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const loadAudio = async (index: number) => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }

    const sound = new Audio.Sound();
    
    try {
      await sound.loadAsync({ uri: audioFiles[index].path });
      soundRef.current = sound;
      
      const status = await sound.getStatusAsync();
      setDuration(status.durationMillis || 0);
      
      sound.setOnPlaybackStatusUpdate(updatePlaybackStatus);
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const updatePlaybackStatus = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish) {
        handleNext();
      }
    }
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  };

  const handleSeek = async (value: number) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(value);
  };

  const handlePrevious = () => {
    const newIndex = currentTrack > 0 ? currentTrack - 1 : audioFiles.length - 1;
    setCurrentTrack(newIndex);
    loadAudio(newIndex);
    if (isPlaying) {
      soundRef.current?.playAsync();
    }
  };

  const handleNext = () => {
    const newIndex = currentTrack < audioFiles.length - 1 ? currentTrack + 1 : 0;
    setCurrentTrack(newIndex);
    loadAudio(newIndex);
    if (isPlaying) {
      soundRef.current?.playAsync();
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderPlaylistItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[
        styles.playlistItem,
        index === currentTrack && styles.currentTrack
      ]}
      onPress={() => {
        setCurrentTrack(index);
        loadAudio(index);
        if (isPlaying) {
          soundRef.current?.playAsync();
        }
      }}
    >
      <Text style={styles.trackIcon}>🎵</Text>
      <View style={styles.trackInfo}>
        <Text style={styles.trackName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.trackDuration}>
          {formatTime(item.size)} • {index === currentTrack && isPlaying ? 'Playing' : 'Paused'}
        </Text>
      </View>
      {index === currentTrack && (
        <Text style={styles.currentIndicator}>▶</Text>
      )}
    </TouchableOpacity>
  );

  if (audioFiles.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noAudioText}>No audio files found</Text>
      </View>
    );
  }

  const currentAudio = audioFiles[currentTrack];

  return (
    <View style={styles.container}>
      <View style={styles.player}>
        <View style={styles.albumArt}>
          <Text style={styles.albumArtIcon}>🎵</Text>
        </View>

        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {currentAudio?.name || 'Unknown Track'}
          </Text>
          <Text style={styles.trackArtist}>Vault Audio</Text>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${(position / duration) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={handlePrevious}>
            <Text style={styles.controlIcon}>⏮️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={togglePlayPause}>
            <Text style={styles.playPauseIcon}>
              {isPlaying ? '⏸️' : '▶️'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleNext}>
            <Text style={styles.controlIcon}>⏭️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.playlist}>
        <Text style={styles.playlistTitle}>Playlist</Text>
        <FlatList
          data={audioFiles}
          renderItem={renderPlaylistItem}
          keyExtractor={item => item.id}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  player: {
    backgroundColor: '#2c2c2e',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3c',
  },
  albumArt: {
    width: 200,
    height: 200,
    backgroundColor: '#3a3a3c',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  albumArtIcon: {
    fontSize: 80,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  trackTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  trackArtist: {
    color: '#8e8e93',
    fontSize: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#3a3a3c',
    borderRadius: 2,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  timeText: {
    color: '#8e8e93',
    fontSize: 12,
    minWidth: 40,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 24,
    color: '#fff',
  },
  playPauseIcon: {
    fontSize: 36,
    color: '#fff',
  },
  playlist: {
    flex: 1,
    padding: 15,
  },
  playlistTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2c2e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  currentTrack: {
    backgroundColor: '#007AFF',
  },
  trackIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  trackDuration: {
    color: '#8e8e93',
    fontSize: 12,
  },
  currentIndicator: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noAudioText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default AudioPlayerScreen;