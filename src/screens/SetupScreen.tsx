// src/screens/SetupScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useVault } from '../context/VaultContext';

type SetupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Setup'>;

interface Props {
  navigation: SetupScreenNavigationProp;
}

const SetupScreen: React.FC<Props> = ({ navigation }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(1);
  const { setPin, toggleBiometrics } = useVault();

  const handleNumberPress = (num: string) => {
    if (step === 1) {
      if (pin.length < 6) {
        const newPin = pin + num;
        setPin(newPin);
        if (newPin.length === 6) {
          setTimeout(() => setStep(2), 500);
        }
      }
    } else if (step === 2) {
      if (confirmPin.length < 6) {
        const newConfirmPin = confirmPin + num;
        setConfirmPin(newConfirmPin);
        if (newConfirmPin.length === 6) {
          if (pin === newConfirmPin) {
            setPin(pin);
            setStep(3);
          } else {
            Alert.alert('Error', 'PINs do not match. Please try again.');
            setConfirmPin('');
          }
        }
      }
    }
  };

  const handleBackspace = () => {
    if (step === 1) {
      setPin(pin.slice(0, -1));
    } else if (step === 2) {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const handleBiometricsEnable = () => {
    toggleBiometrics(true);
    navigation.navigate('VaultHome');
  };

  const handleBiometricsSkip = () => {
    toggleBiometrics(false);
    navigation.navigate('VaultHome');
  };

  const PinDisplay: React.FC<{ value: string }> = ({ value }) => (
    <View style={styles.pinDisplay}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <View
          key={i}
          style={[
            styles.pinDot,
            i < value.length && styles.pinDotFilled
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
      <Text style={styles.title}>
        {step === 1 && 'Set Vault PIN'}
        {step === 2 && 'Confirm Vault PIN'}
        {step === 3 && 'Enable Biometrics'}
      </Text>
      
      <Text style={styles.subtitle}>
        {step === 1 && 'Enter a 6-digit PIN to secure your vault'}
        {step === 2 && 'Confirm your 6-digit PIN'}
        {step === 3 && 'Add an extra layer of security with biometrics'}
      </Text>

      {step < 3 && (
        <>
          <PinDisplay value={step === 1 ? pin : confirmPin} />
          
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
        </>
      )}

      {step === 3 && (
        <View style={styles.biometricsContainer}>
          <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricsEnable}>
            <Text style={styles.biometricButtonText}>Enable Biometrics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.skipButton} onPress={handleBiometricsSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      )}
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
    marginBottom: 10,
  },
  subtitle: {
    color: '#8e8e93',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  pinDisplay: {
    flexDirection: 'row',
    marginBottom: 50,
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
  biometricsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  biometricButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  biometricButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    padding: 15,
  },
  skipButtonText: {
    color: '#8e8e93',
    fontSize: 16,
  },
});

export default SetupScreen;