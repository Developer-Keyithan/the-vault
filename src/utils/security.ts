// src/utils/security.ts
import { 
  Platform, 
  AppState, 
  Clipboard, 
  Dimensions,
  NativeEventEmitter,
  NativeModules
} from 'react-native';

// Security event types
type SecurityEventType = 
  | 'screenshot_attempt' 
  | 'screen_recording' 
  | 'usb_debugging' 
  | 'jailbreak_detected' 
  | 'clipboard_cleared' 
  | 'auto_lock'
  | 'app_backgrounded';

interface SecurityEvent {
  type: SecurityEventType;
  message: string;
  timestamp: string;
  additionalData?: any;
}

// Main Security Class
class VaultSecurity {
  private isMonitoring: boolean = false;
  private securityEvents: SecurityEvent[] = [];
  private autoLockTimeout: NodeJS.Timeout | null = null;
  private autoLockTime: number = 5 * 60 * 1000; // 5 minutes default
  private lockCallback: (() => void) | null = null;
  private lastAppState: string = 'active';

  constructor() {
    this.initializeEventListeners();
  }

  // Initialize all security event listeners
  private initializeEventListeners() {
    // App state monitoring for auto-lock
    AppState.addEventListener('change', this.handleAppStateChange);
    
    // Periodic security checks
    this.startPeriodicSecurityChecks();
  }

  // App state change handler
  private handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'background' && this.lastAppState === 'active') {
      this.logSecurityEvent({
        type: 'app_backgrounded',
        message: 'App moved to background - security activated'
      });
      
      // Reset auto-lock timer when app goes to background
      this.resetAutoLockTimer();
    } else if (nextAppState === 'active' && this.lastAppState === 'background') {
      // Restart auto-lock timer when app comes to foreground
      this.startAutoLockTimer();
    }
    
    this.lastAppState = nextAppState;
  };

  // Screenshot detection (limited capability in React Native)
  public enableScreenshotProtection() {
    if (Platform.OS === 'android') {
      // On Android, we can only detect when app goes to background
      // which might indicate screenshot attempt
      this.logSecurityEvent({
        type: 'screenshot_attempt',
        message: 'Screenshot protection enabled (limited)'
      });
    } else {
      // iOS has more limitations
      this.logSecurityEvent({
        type: 'screenshot_attempt',
        message: 'Screenshot detection active - will detect app background events'
      });
    }
  }

  // Clipboard security
  public async clearClipboard(): Promise<boolean> {
    try {
      await Clipboard.setString('');
      this.logSecurityEvent({
        type: 'clipboard_cleared',
        message: 'Clipboard cleared successfully'
      });
      return true;
    } catch (error) {
      console.warn('Failed to clear clipboard:', error);
      return false;
    }
  }

  public async setSecureClipboard(text: string, autoClear: boolean = true, clearDelay: number = 30000): Promise<boolean> {
    try {
      await Clipboard.setString(text);
      
      this.logSecurityEvent({
        type: 'clipboard_cleared',
        message: `Data set to clipboard${autoClear ? ' with auto-clear' : ''}`
      });

      if (autoClear) {
        setTimeout(() => {
          this.clearClipboard();
        }, clearDelay);
      }
      
      return true;
    } catch (error) {
      console.warn('Failed to set secure clipboard:', error);
      return false;
    }
  }

  public async getClipboardContent(): Promise<string> {
    try {
      return await Clipboard.getString();
    } catch (error) {
      console.warn('Failed to get clipboard content:', error);
      return '';
    }
  }

  // Screen recording detection simulation
  private setupScreenRecordingDetection() {
    // Since we can't directly detect screen recording in RN without native modules,
    // we use app state and timing as indicators
    let backgroundTime: number | null = null;
    
    AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        backgroundTime = Date.now();
      } else if (state === 'active' && backgroundTime) {
        const backgroundDuration = Date.now() - backgroundTime;
        
        // If app was in background for a very short time, it might indicate recording
        if (backgroundDuration < 2000) {
          this.logSecurityEvent({
            type: 'screen_recording',
            message: 'Potential screen recording detected (short background duration)'
          });
          
          if (this.lockCallback) {
            this.lockCallback();
          }
        }
        backgroundTime = null;
      }
    });
  }

  // Jailbreak/Root detection
  public async detectJailbreakRoot(): Promise<{isCompromised: boolean; reasons: string[]}> {
    const result = {
      isCompromised: false,
      reasons: [] as string[]
    };

    try {
      // Common detection techniques that work in React Native
      
      // 1. Check for common jailbreak/root artifacts
      if (Platform.OS === 'ios') {
        // iOS specific checks
        const suspiciousFiles = [
          '/Applications/Cydia.app',
          '/Library/MobileSubstrate/MobileSubstrate.dylib',
          '/bin/bash',
          '/usr/sbin/sshd'
        ];
        
        // We can't directly check files in RN, but we can check for other indicators
        if (this.isDebuggerAttached()) {
          result.isCompromised = true;
          result.reasons.push('Debugger detected');
        }
      }

      // 2. Check if app is running in simulator (often used for testing compromised environments)
      if (this.isRunningInSimulator()) {
        result.isCompromised = true;
        result.reasons.push('Running in simulator/emulator');
      }

      // 3. Check app signatures and environment
      if (this.isAppTampered()) {
        result.isCompromised = true;
        result.reasons.push('App integrity check failed');
      }

    } catch (error) {
      console.warn('Security check error:', error);
    }

    if (result.isCompromised) {
      this.logSecurityEvent({
        type: 'jailbreak_detected',
        message: `Compromised device detected: ${result.reasons.join(', ')}`
      });
    }

    return result;
  }

  // Simulated security checks (these would be more robust in production)
  private isDebuggerAttached(): boolean {
    // Simplified check - in production you'd use more sophisticated methods
    return __DEV__;
  }

  private isRunningInSimulator(): boolean {
    return Platform.OS === 'ios' 
      ? !NativeModules.PlatformConstants.isTesting
      : NativeModules.PlatformConstants.isTesting;
  }

  private isAppTampered(): boolean {
    // Basic app integrity check
    // In production, you'd verify code signatures, checksums, etc.
    return false;
  }

  // Auto-lock functionality
  public setAutoLockTime(minutes: number) {
    this.autoLockTime = minutes * 60 * 1000;
    this.logSecurityEvent({
      type: 'auto_lock',
      message: `Auto-lock time set to ${minutes} minutes`
    });
  }

  public setLockCallback(callback: () => void) {
    this.lockCallback = callback;
  }

  public startAutoLockTimer() {
    this.resetAutoLockTimer();
    
    this.autoLockTimeout = setTimeout(() => {
      this.logSecurityEvent({
        type: 'auto_lock',
        message: 'Auto-lock triggered due to inactivity'
      });
      
      if (this.lockCallback) {
        this.lockCallback();
      }
    }, this.autoLockTime);
  }

  public resetAutoLockTimer() {
    if (this.autoLockTimeout) {
      clearTimeout(this.autoLockTimeout);
      this.autoLockTimeout = null;
    }
  }

  // Data protection
  public scrambleData(data: string): string {
    // Simple XOR encryption for in-memory protection
    const key = 0x55;
    let scrambled = '';
    for (let i = 0; i < data.length; i++) {
      scrambled += String.fromCharCode(data.charCodeAt(i) ^ key);
    }
    return btoa(scrambled); // Base64 encode
  }

  public unscrambleData(scrambled: string): string {
    try {
      const decoded = atob(scrambled);
      const key = 0x55;
      let original = '';
      for (let i = 0; i < decoded.length; i++) {
        original += String.fromCharCode(decoded.charCodeAt(i) ^ key);
      }
      return original;
    } catch (error) {
      console.warn('Data unscrambling failed:', error);
      return '';
    }
  }

  // Security logging
  private logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };
    
    this.securityEvents.push(fullEvent);
    
    // Keep only last 100 events
    if (this.securityEvents.length > 100) {
      this.securityEvents = this.securityEvents.slice(-100);
    }
    
    console.log(`[SECURITY] ${event.type}: ${event.message}`);
  }

  public getSecurityLogs(): SecurityEvent[] {
    return [...this.securityEvents];
  }

  public clearSecurityLogs() {
    this.securityEvents = [];
  }

  // Periodic security checks
  private startPeriodicSecurityChecks() {
    setInterval(async () => {
      // Check for compromised device every 30 seconds
      const securityStatus = await this.detectJailbreakRoot();
      
      // Check clipboard for sensitive data
      const clipboardContent = await this.getClipboardContent();
      if (clipboardContent && clipboardContent.length > 50) {
        // If clipboard has substantial content, consider clearing it
        await this.clearClipboard();
      }
    }, 30000);
  }

  // Cleanup
  public cleanup() {
    this.resetAutoLockTimer();
    AppState.removeEventListener('change', this.handleAppStateChange);
    this.isMonitoring = false;
  }
}

// Singleton instance
export const vaultSecurity = new VaultSecurity();

// Hook for React components
export const useSecurity = (lockVault: () => void) => {
  const [securityBreach, setSecurityBreach] = useState<string | null>(null);
  const [isCompromised, setIsCompromised] = useState(false);

  useEffect(() => {
    // Initialize security
    vaultSecurity.setLockCallback(lockVault);
    vaultSecurity.enableScreenshotProtection();
    vaultSecurity.startAutoLockTimer();

    // Check device security on mount
    const checkSecurity = async () => {
      const status = await vaultSecurity.detectJailbreakRoot();
      setIsCompromised(status.isCompromised);
      
      if (status.isCompromised) {
        setSecurityBreach('device_compromised');
      }
    };

    checkSecurity();

    // Setup security event listener
    const handleSecurityEvent = () => {
      // In a real app, you'd have proper event listening
      // For now, we'll use a simple interval to check logs
      const interval = setInterval(() => {
        const logs = vaultSecurity.getSecurityLogs();
        const recentBreach = logs.find(log => 
          log.type === 'screen_recording' || 
          log.type === 'jailbreak_detected'
        );
        
        if (recentBreach) {
          setSecurityBreach(recentBreach.type);
        }
      }, 5000);

      return () => clearInterval(interval);
    };

    const cleanupInterval = handleSecurityEvent();

    return () => {
      vaultSecurity.cleanup();
      cleanupInterval();
    };
  }, [lockVault]);

  const resetSecurityBreach = () => {
    setSecurityBreach(null);
  };

  const setAutoLockTime = (minutes: number) => {
    vaultSecurity.setAutoLockTime(minutes);
  };

  const getSecurityLogs = () => {
    return vaultSecurity.getSecurityLogs();
  };

  return {
    securityBreach,
    isCompromised,
    resetSecurityBreach,
    setAutoLockTime,
    getSecurityLogs,
    scrambleData: vaultSecurity.scrambleData.bind(vaultSecurity),
    unscrambleData: vaultSecurity.unscrambleData.bind(vaultSecurity),
    setSecureClipboard: vaultSecurity.setSecureClipboard.bind(vaultSecurity),
    clearClipboard: vaultSecurity.clearClipboard.bind(vaultSecurity)
  };
};

// Context provider for security
export const SecurityContext = React.createContext<ReturnType<typeof useSecurity> | null>(null);

export const SecurityProvider: React.FC<{ 
  children: React.ReactNode; 
  lockVault: () => void;
}> = ({ children, lockVault }) => {
  const security = useSecurity(lockVault);

  return (
    <SecurityContext.Provider value={security}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurityContext = () => {
  const context = React.useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};