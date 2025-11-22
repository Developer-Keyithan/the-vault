// src/screens/LockScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useVault } from '../context/VaultContext';
import { useBiometrics } from '../services/useBiometrics';

type LockScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Lock'>;

interface Props {
  navigation: LockScreenNavigationProp;
}

const LockScreen: React.FC<Props> = ({ navigation }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const { vaultState, unlockVault } = useVault();
  const { authenticate } = useBiometrics();

  useEffect(() => {
    if (vaultState.biometricsEnabled) {
      handleBiometricAuth();
    }
  }, []);

  const handleBiometricAuth = async () => {
    const success = await authenticate();
    if (success) {
      navigation.navigate('VaultHome');
    }
  };

  const handleNumberPress = async (num: string) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 6) {
        const success = await unlockVault(newPin);
        if (success) {
          navigation.navigate('VaultHome');
        } else {
          setError(true);
          setPin('');
          setTimeout(() => setError(false), 1000);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const PinDisplay: React.FC<{ value: string; error: boolean }> = ({ value, error }) => (
    <View style={styles.pinDisplay}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <View
          key={i}
          style={[
            styles.pinDot,
            i < value.length && styles.pinDotFilled,
            error && styles.pinDotError
          ]}
        />
      ))}
    </View>
  );

  const NumberButton: React.FC<{ number: string }> = ({ number }) => (
    <TouchableOpacity
      style={styles.numberButton}
      onPress={() => handleNumberPress(number)}
    >
      <Text style={styles.numberText}>{number}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Vault PIN</Text>
      
      <PinDisplay value={pin} error={error} />
      
      {vaultState.biometricsEnabled && (
        <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricAuth}>
          <Text style={styles.biometricButtonText}>Use Biometrics</Text>
        </TouchableOpacity>
      )}

      <View style={styles.numberPad}>
        <View style={styles.numberRow}>
          <NumberButton number="1" />
          <NumberButton number="2" />
          <NumberButton number="3" />
        </View>
        <View style={styles.numberRow}>
          <NumberButton number="4" />
          <NumberButton number="5" />
          <NumberButton number="6" />
        </View>
        <View style={styles.numberRow}>
          <NumberButton number="7" />
          <NumberButton number="8" />
          <NumberButton number="9" />
        </View>
        <View style={styles.numberRow}>
          <View style={styles.numberButton} />
          <NumberButton number="0" />
          <TouchableOpacity style={styles.numberButton} onPress={handleBackspace}>
            <Text style={styles.numberText}>⌫</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  pinDisplay: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    marginHorizontal: 10,
  },
  pinDotFilled: {
    backgroundColor: '#fff',
  },
  pinDotError: {
    borderColor: '#ff453a',
    backgroundColor: '#ff453a',
  },
  biometricButton: {
    marginBottom: 40,
    padding: 15,
  },
  biometricButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  numberPad: {
    width: '100%',
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  numberButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2c2c2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: '#fff',
    fontSize: 24,
  },
});

export default LockScreen;