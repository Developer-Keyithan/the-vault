// src/screens/CalculatorScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useVault } from '../context/VaultContext';

type CalculatorScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Calculator'>;

interface Props {
  navigation: CalculatorScreenNavigationProp;
}

const CalculatorScreen: React.FC<Props> = ({ navigation }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const { vaultState } = useVault();

  useEffect(() => {
    if (display === '+1234=') {
      if (vaultState.isFirstTime) {
        navigation.navigate('Setup');
      } else {
        navigation.navigate('Lock');
      }
      setDisplay('0');
    }
  }, [display, vaultState.isFirstTime, navigation]);

  const handleNumberPress = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperationPress = (op: string) => {
    const inputValue = parseFloat(display);
    
    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);
      
      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }
    
    setWaitingForNewValue(true);
    setOperation(op);
  };

  const calculate = (a: number, b: number, operation: string): number => {
    switch (operation) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return a / b;
      default: return b;
    }
  };

  const handleEqualsPress = () => {
    const inputValue = parseFloat(display);
    
    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const handleClearPress = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const handleDecimalPress = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const Button: React.FC<{ value: string; onPress: (value: string) => void; style?: any }> = 
    ({ value, onPress, style }) => (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={() => onPress(value)}
    >
      <Text style={styles.buttonText}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.display}>
        <Text style={styles.displayText}>{display}</Text>
      </View>
      
      <View style={styles.buttons}>
        <View style={styles.row}>
          <Button value="C" onPress={handleClearPress} style={styles.functionButton} />
          <Button value="+/-" onPress={() => {}} style={styles.functionButton} />
          <Button value="%" onPress={() => {}} style={styles.functionButton} />
          <Button value="/" onPress={handleOperationPress} style={styles.operationButton} />
        </View>
        
        <View style={styles.row}>
          <Button value="7" onPress={handleNumberPress} />
          <Button value="8" onPress={handleNumberPress} />
          <Button value="9" onPress={handleNumberPress} />
          <Button value="*" onPress={handleOperationPress} style={styles.operationButton} />
        </View>
        
        <View style={styles.row}>
          <Button value="4" onPress={handleNumberPress} />
          <Button value="5" onPress={handleNumberPress} />
          <Button value="6" onPress={handleNumberPress} />
          <Button value="-" onPress={handleOperationPress} style={styles.operationButton} />
        </View>
        
        <View style={styles.row}>
          <Button value="1" onPress={handleNumberPress} />
          <Button value="2" onPress={handleNumberPress} />
          <Button value="3" onPress={handleNumberPress} />
          <Button value="+" onPress={handleOperationPress} style={styles.operationButton} />
        </View>
        
        <View style={styles.row}>
          <Button value="0" onPress={handleNumberPress} style={styles.zeroButton} />
          <Button value="." onPress={handleDecimalPress} />
          <Button value="=" onPress={handleEqualsPress} style={styles.operationButton} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  display: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 20,
  },
  displayText: {
    color: '#fff',
    fontSize: 48,
  },
  buttons: {
    flex: 2,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#333',
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
  },
  functionButton: {
    backgroundColor: '#a5a5a5',
  },
  operationButton: {
    backgroundColor: '#f1a33c',
  },
  zeroButton: {
    flex: 2,
  },
});

export default CalculatorScreen;