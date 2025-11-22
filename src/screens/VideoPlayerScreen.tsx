// src/screens/VideoPlayerScreen.tsx
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useVault } from '../context/VaultContext';

type VideoPlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VideoPlayer'>;

interface Props {
  navigation: VideoPlayerScreenNavigationProp;
  route: any;
}

const VideoPlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<any>({});
  const [showControls, setShowControls] = useState(true);
  const { vaultState } = useVault();

  const { videoId } = route.params;
  const videoFile = vaultState.vaultFiles.find(f => f.id === videoId && f.type === 'video');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [showControls]);

  const togglePlayPause = () => {
    if (status.isPlaying) {
      videoRef.current?.pauseAsync();
    } else {
      videoRef.current?.playAsync();
    }
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!videoFile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Video not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.videoContainer} onPress={toggleControls} activeOpacity={1}>
        <Video
          ref={videoRef}
          source={{ uri: videoFile.path }}
          style={styles.video}
          useNativeControls={false}
          resizeMode="contain"
          onPlaybackStatusUpdate={setStatus}
          shouldPlay={false}
        />

        {showControls && (
          <View style={styles.controlsOverlay}>
            <View style={styles.encryptedOverlay}>
              <Text style={styles.encryptedText}>🔒 ENCRYPTED - EXPORT DISABLED</Text>
            </View>

            <View style={styles.controls}>
              <TouchableOpacity onPress={togglePlayPause}>
                <Text style={styles.controlIcon}>
                  {status.isPlaying ? '⏸️' : '▶️'}
                </Text>
              </TouchableOpacity>

              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>
                  {formatTime(status.positionMillis || 0)}
                </Text>
                
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${((status.positionMillis || 0) / (status.durationMillis || 1)) * 100}%` 
                      }
                    ]} 
                  />
                </View>
                
                <Text style={styles.timeText}>
                  {formatTime(status.durationMillis || 0)}
                </Text>
              </View>

              <Text style={styles.resolutionText}>HD</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  encryptedOverlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    alignItems: 'center',
  },
  encryptedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
  },
  controlIcon: {
    fontSize: 24,
    color: '#fff',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
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
    color: '#fff',
    fontSize: 12,
    minWidth: 40,
  },
  resolutionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default VideoPlayerScreen;