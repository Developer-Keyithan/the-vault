// src/services/useBiometrics.ts
import * as LocalAuthentication from 'expo-local-authentication';

export const useBiometrics = () => {
  const authenticate = async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!hasHardware || !isEnrolled) {
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to unlock vault',
        fallbackLabel: 'Use PIN'
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  };

  return {
    authenticate
  };
};