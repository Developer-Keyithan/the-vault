// src/context/VaultContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MMKV } from 'react-native-mmkv';
import { useEncryption } from '../services/useEncryption';
import { useBiometrics } from '../services/useBiometrics';
import { useVPN } from '../services/useVPN';

interface VaultState {
  isUnlocked: boolean;
  isFirstTime: boolean;
  pin: string;
  biometricsEnabled: boolean;
  autoLockTimer: number;
  currentTheme: Theme;
  currentWallpaper: string;
  vaultFiles: VaultFile[];
  recycleBin: VaultFile[];
  browserHistory: BrowserHistory[];
  downloads: DownloadItem[];
  vpnCountry: string;
  vpnConnected: boolean;
  appDisplayName: string;
  launcherIcon: string;
  fakeMode: boolean;
}

interface Theme {
  mode: 'dark' | 'light';
  accentColor: string;
  iconShape: 'circle' | 'square' | 'rounded';
  blurIntensity: number;
}

interface VaultFile {
  id: string;
  name: string;
  path: string;
  type: 'photo' | 'video' | 'audio' | 'document' | 'zip' | 'note' | 'password';
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  encrypted: boolean;
  thumbnail?: string;
}

interface BrowserHistory {
  id: string;
  url: string;
  title: string;
  timestamp: Date;
  encrypted: boolean;
}

interface DownloadItem {
  id: string;
  url: string;
  filename: string;
  path: string;
  progress: number;
  speed: number;
  status: 'downloading' | 'paused' | 'completed' | 'error';
  size: number;
  type: string;
}

interface VaultContextType {
  vaultState: VaultState;
  setPin: (pin: string) => void;
  unlockVault: (pin: string) => Promise<boolean>;
  lockVault: () => void;
  toggleBiometrics: (enabled: boolean) => void;
  setTheme: (theme: Partial<Theme>) => void;
  setWallpaper: (wallpaper: string) => void;
  addFile: (file: Omit<VaultFile, 'id'>) => void;
  deleteFile: (fileId: string, permanent?: boolean) => void;
  restoreFile: (fileId: string) => void;
  addBrowserHistory: (history: Omit<BrowserHistory, 'id'>) => void;
  addDownload: (download: Omit<DownloadItem, 'id' | 'progress' | 'speed' | 'status'>) => void;
  updateDownload: (downloadId: string, updates: Partial<DownloadItem>) => void;
  setVPNCountry: (country: string) => void;
  toggleVPN: (connected: boolean) => void;
  setAppDisplayName: (name: string) => void;
  setLauncherIcon: (icon: string) => void;
  toggleFakeMode: (enabled: boolean) => void;
  scanAndRestore: () => Promise<RestoreResult>;
}

interface RestoreResult {
  found: number;
  restored: number;
  corrupted: number;
}

const defaultTheme: Theme = {
  mode: 'dark',
  accentColor: '#007AFF',
  iconShape: 'rounded',
  blurIntensity: 10
};

const defaultState: VaultState = {
  isUnlocked: false,
  isFirstTime: true,
  pin: '',
  biometricsEnabled: false,
  autoLockTimer: 300,
  currentTheme: defaultTheme,
  currentWallpaper: 'default',
  vaultFiles: [],
  recycleBin: [],
  browserHistory: [],
  downloads: [],
  vpnCountry: 'US',
  vpnConnected: false,
  appDisplayName: 'Calculator',
  launcherIcon: 'default',
  fakeMode: false
};

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vaultState, setVaultState] = useState<VaultState>(defaultState);
  const storage = new MMKV();
  const { encrypt, decrypt } = useEncryption();
  const { authenticate } = useBiometrics();
  const { connectVPN, disconnectVPN } = useVPN();

  useEffect(() => {
    loadVaultState();
  }, []);

  const loadVaultState = async () => {
    try {
      const stored = storage.getString('vault_state');
      if (stored) {
        const decrypted = await decrypt(stored);
        setVaultState(JSON.parse(decrypted));
      }
    } catch (error) {
      console.log('No existing vault state found');
    }
  };

  const saveVaultState = async (state: VaultState) => {
    try {
      const encrypted = await encrypt(JSON.stringify(state));
      storage.set('vault_state', encrypted);
    } catch (error) {
      console.error('Failed to save vault state');
    }
  };

  const setPin = (pin: string) => {
    const newState = { ...vaultState, pin, isFirstTime: false };
    setVaultState(newState);
    saveVaultState(newState);
  };

  const unlockVault = async (pin: string): Promise<boolean> => {
    if (pin === vaultState.pin) {
      const newState = { ...vaultState, isUnlocked: true };
      setVaultState(newState);
      saveVaultState(newState);
      
      if (vaultState.vpnConnected) {
        connectVPN(vaultState.vpnCountry);
      }
      
      return true;
    }
    return false;
  };

  const lockVault = () => {
    const newState = { ...vaultState, isUnlocked: false };
    setVaultState(newState);
    saveVaultState(newState);
    
    if (vaultState.vpnConnected) {
      disconnectVPN();
    }
  };

  const toggleBiometrics = (enabled: boolean) => {
    const newState = { ...vaultState, biometricsEnabled: enabled };
    setVaultState(newState);
    saveVaultState(newState);
  };

  const setTheme = (theme: Partial<Theme>) => {
    const newState = { ...vaultState, currentTheme: { ...vaultState.currentTheme, ...theme } };
    setVaultState(newState);
    saveVaultState(newState);
  };

  const setWallpaper = (wallpaper: string) => {
    const newState = { ...vaultState, currentWallpaper: wallpaper };
    setVaultState(newState);
    saveVaultState(newState);
  };

  const addFile = (file: Omit<VaultFile, 'id'>) => {
    const newFile: VaultFile = {
      ...file,
      id: Math.random().toString(36).substr(2, 9)
    };
    const newState = { ...vaultState, vaultFiles: [...vaultState.vaultFiles, newFile] };
    setVaultState(newState);
    saveVaultState(newState);
  };

  const deleteFile = (fileId: string, permanent: boolean = false) => {
    const file = vaultState.vaultFiles.find(f => f.id === fileId);
    if (file) {
      if (permanent) {
        const newState = { 
          ...vaultState, 
          vaultFiles: vaultState.vaultFiles.filter(f => f.id !== fileId) 
        };
        setVaultState(newState);
        saveVaultState(newState);
      } else {
        const newState = { 
          ...vaultState, 
          vaultFiles: vaultState.vaultFiles.filter(f => f.id !== fileId),
          recycleBin: [...vaultState.recycleBin, { ...file, deletedAt: new Date() } as any]
        };
        setVaultState(newState);
        saveVaultState(newState);
      }
    }
  };

  const restoreFile = (fileId: string) => {
    const file = vaultState.recycleBin.find(f => f.id === fileId);
    if (file) {
      const newState = { 
        ...vaultState, 
        recycleBin: vaultState.recycleBin.filter(f => f.id !== fileId),
        vaultFiles: [...vaultState.vaultFiles, file]
      };
      setVaultState(newState);
      saveVaultState(newState);
    }
  };

  const addBrowserHistory = (history: Omit<BrowserHistory, 'id'>) => {
    const newHistory: BrowserHistory = {
      ...history,
      id: Math.random().toString(36).substr(2, 9)
    };
    const newState = { ...vaultState, browserHistory: [...vaultState.browserHistory, newHistory] };
    setVaultState(newState);
    saveVaultState(newState);
  };

  const addDownload = (download: Omit<DownloadItem, 'id' | 'progress' | 'speed' | 'status'>) => {
    const newDownload: DownloadItem = {
      ...download,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      speed: 0,
      status: 'downloading'
    };
    const newState = { ...vaultState, downloads: [...vaultState.downloads, newDownload] };
    setVaultState(newState);
    saveVaultState(newState);
  };

  const updateDownload = (downloadId: string, updates: Partial<DownloadItem>) => {
    const newState = {
      ...vaultState,
      downloads: vaultState.downloads.map(download =>
        download.id === downloadId ? { ...download, ...updates } : download
      )
    };
    setVaultState(newState);
    saveVaultState(newState);
  };

  const setVPNCountry = (country: string) => {
    const newState = { ...vaultState, vpnCountry: country };
    setVaultState(newState);
    saveVaultState(newState);
  };

  const toggleVPN = (connected: boolean) => {
    const newState = { ...vaultState, vpnConnected: connected };
    setVaultState(newState);
    saveVaultState(newState);
    
    if (connected) {
      connectVPN(vaultState.vpnCountry);
    } else {
      disconnectVPN();
    }
  };

  const setAppDisplayName = (name: string) => {
    const newState = { ...vaultState, appDisplayName: name };
    setVaultState(newState);
    saveVaultState(newState);
  };

  const setLauncherIcon = (icon: string) => {
    const newState = { ...vaultState, launcherIcon: icon };
    setVaultState(newState);
    saveVaultState(newState);
  };

  const toggleFakeMode = (enabled: boolean) => {
    const newState = { ...vaultState, fakeMode: enabled };
    setVaultState(newState);
    saveVaultState(newState);
  };

  const scanAndRestore = async (): Promise<RestoreResult> => {
    // TODO: implement file system scanning for vault extensions
    const result = { found: 0, restored: 0, corrupted: 0 };
    return result;
  };

  return (
    <VaultContext.Provider value={{
      vaultState,
      setPin,
      unlockVault,
      lockVault,
      toggleBiometrics,
      setTheme,
      setWallpaper,
      addFile,
      deleteFile,
      restoreFile,
      addBrowserHistory,
      addDownload,
      updateDownload,
      setVPNCountry,
      toggleVPN,
      setAppDisplayName,
      setLauncherIcon,
      toggleFakeMode,
      scanAndRestore
    }}>
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};