// src/hooks/useVaultSecurity.ts
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useVault } from '../context/VaultContext';
import { vaultSecurity } from '../utils/security';

export const useVaultSecurity = () => {
  const { lockVault, vaultState } = useVault();

  useEffect(() => {
    // Initialize security system
    vaultSecurity.setLockCallback(lockVault);
    vaultSecurity.setAutoLockTime(vaultState.autoLockTimer / 60); // Convert seconds to minutes
    
    // Start security features
    vaultSecurity.enableScreenshotProtection();
    vaultSecurity.startAutoLockTimer();

    // Handle app state changes
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground - restart auto-lock timer
        vaultSecurity.startAutoLockTimer();
      } else if (nextAppState === 'background') {
        // App went to background - security measures
        vaultSecurity.resetAutoLockTimer();
        
        // Optional: Auto-lock when app goes to background
        if (vaultState.autoLockTimer === 0) {
          lockVault();
        }
      }
    });

    return () => {
      subscription.remove();
      vaultSecurity.cleanup();
    };
  }, [lockVault, vaultState.autoLockTimer]);

  return {
    // Security functions exposed to components
    setAutoLockTime: vaultSecurity.setAutoLockTime.bind(vaultSecurity),
    getSecurityLogs: vaultSecurity.getSecurityLogs.bind(vaultSecurity),
    detectJailbreakRoot: vaultSecurity.detectJailbreakRoot.bind(vaultSecurity),
    scrambleData: vaultSecurity.scrambleData.bind(vaultSecurity),
    unscrambleData: vaultSecurity.unscrambleData.bind(vaultSecurity),
    setSecureClipboard: vaultSecurity.setSecureClipboard.bind(vaultSecurity),
    clearClipboard: vaultSecurity.clearClipboard.bind(vaultSecurity)
  };
};