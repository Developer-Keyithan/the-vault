// src/screens/BrowserScreen.tsx
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useVault } from '../context/VaultContext';

type BrowserScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Browser'>;

interface Props {
  navigation: BrowserScreenNavigationProp;
}

const BrowserScreen: React.FC<Props> = ({ navigation }) => {
  const [url, setUrl] = useState('https://google.com');
  const [currentUrl, setCurrentUrl] = useState('https://google.com');
  const [secure, setSecure] = useState(true);
  const webViewRef = useRef<WebView>(null);
  const { vaultState, addBrowserHistory, addDownload } = useVault();

  const handleGo = () => {
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = 'https://' + url;
    }
    setCurrentUrl(formattedUrl);
    setUrl(formattedUrl);
    
    addBrowserHistory({
      url: formattedUrl,
      title: 'Loading...',
      timestamp: new Date(),
      encrypted: true
    });
  };

  const handleNavigationStateChange = (navState: any) => {
    setUrl(navState.url);
    setCurrentUrl(navState.url);
    setSecure(!navState.url.startsWith('http://'));
    
    if (navState.title && navState.title !== 'Loading...') {
      addBrowserHistory({
        url: navState.url,
        title: navState.title,
        timestamp: new Date(),
        encrypted: true
      });
    }
  };

  const handleDownloadMedia = (mediaUrl: string) => {
    Alert.alert(
      'Download Media',
      'Save this media to your vault?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Download', 
          onPress: () => {
            const filename = mediaUrl.split('/').pop() || 'download';
            addDownload({
              url: mediaUrl,
              filename,
              path: '',
              size: 0,
              type: mediaUrl.split('.').pop() || 'unknown'
            });
          }
        }
      ]
    );
  };

  const handleMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'MEDIA_DETECTED') {
      handleDownloadMedia(data.url);
    }
  };

  const injectedJavaScript = `
    // Media detection
    const observer = new MutationObserver(() => {
      document.querySelectorAll('img, video, audio').forEach(element => {
        element.addEventListener('click', (e) => {
          const url = element.src || element.currentSrc;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'MEDIA_DETECTED',
            url: url
          }));
          e.preventDefault();
        });
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Block image right-click
    document.addEventListener('contextmenu', (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    });
    
    true;
  `;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.urlBar}>
        <View style={styles.securityIndicator}>
          <Text style={[styles.lockIcon, secure && styles.secureLock]}>
            {secure ? '🔒' : '🔓'}
          </Text>
          <Text style={styles.vpnFlag}>🇺🇸</Text>
        </View>
        
        <TextInput
          style={styles.urlInput}
          value={url}
          onChangeText={setUrl}
          onSubmitEditing={handleGo}
          placeholder="Enter URL"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <TouchableOpacity style={styles.goButton} onPress={handleGo}>
          <Text style={styles.goButtonText}>Go</Text>
        </TouchableOpacity>
      </View>

      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        injectedJavaScript={injectedJavaScript}
        startInLoadingState={true}
        allowsFullscreenVideo={true}
        allowsInlineMediaPlayback={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  urlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#2c2c2e',
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3c',
  },
  securityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  lockIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  secureLock: {
    color: '#34C759',
  },
  vpnFlag: {
    fontSize: 16,
  },
  urlInput: {
    flex: 1,
    backgroundColor: '#3a3a3c',
    color: '#fff',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  goButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  goButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  webview: {
    flex: 1,
  },
});

export default BrowserScreen;