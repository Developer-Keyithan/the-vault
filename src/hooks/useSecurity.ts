// src/hooks/useSecurity.ts
import { useEffect, useCallback, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { 
  initializeSecurity, 
  cleanupSecurity, 
  autoLockTimer,
  screenRecordingMonitor,
  usbDebuggingMonitor,
  securityLogger,
  detectJailbreakRoot,
  scrambleSensitiveData,
  unscrambleSensitiveData,
  secureClipboard
} from '../utils/security';

export const useSecurity = (lockVault: () => void) => {
  const [isJailbroken, setIsJailbroken] = useState(false);
  const [securityBreach, setSecurityBreach] = useState<string | null>(null);

  useEffect(() => {
    // Initialize security system
    initializeSecurity(lockVault);

    // Check for jailbreak/root on app start
    checkDeviceSecurity();

    // Set up app state listener for auto-lock
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Set up security breach listeners
    const handleSecurityBreach = (event: any) => {
      setSecurityBreach(event.detail.type);
      securityLogger.logEvent({
        type: 'screen_recording',
        message: `Security breach: ${event.detail.type}`
      });
    };

    const handleAutoLock = () => {
      lockVault();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('vaultSecurityBreach', handleSecurityBreach);
      window.addEventListener('vaultAutoLock', handleAutoLock);
    }

    return () => {
      subscription.remove();
      cleanupSecurity();
      
      if (typeof window !== 'undefined') {
        window.removeEventListener('vaultSecurityBreach', handleSecurityBreach);
        window.removeEventListener('vaultAutoLock', handleAutoLock);
      }
    };
  }, [lockVault]);

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (nextAppState === 'background') {
      // App going to background - reset timer when we come back
      autoLockTimer.resetTimer();
    } else if (nextAppState === 'active') {
      // App becoming active - restart auto-lock timer
      autoLockTimer.startTimer();
    }
  }, []);

  const checkDeviceSecurity = async () => {
    try {
      const result = await detectJailbreakRoot();
      setIsJailbroken(result.isJailbroken);
      
      if (result.isJailbroken) {
        securityLogger.logEvent({
          type: 'jailbreak_detected',
          message: `Jailbroken/rooted device detected: ${result.reasons.join(', ')}`
        });
        
        // Optional: Auto-lock or show warning
        setSecurityBreach('jailbreak_detected');
      }
    } catch (error) {
      console.warn('Security check failed:', error);
    }
  };

  const resetSecurityBreach = () => {
    setSecurityBreach(null);
  };

  const getSecurityLogs = () => {
    return securityLogger.getLogs();
  };

  const setAutoLockTime = (minutes: number) => {
    autoLockTimer.setLockTime(minutes * 60 * 1000);
  };

  return {
    isJailbroken,
    securityBreach,
    resetSecurityBreach,
    getSecurityLogs,
    setAutoLockTime,
    scrambleSensitiveData,
    unscrambleSensitiveData,
    secureClipboard
  };
};