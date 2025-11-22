// src/screens/SettingsScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Switch, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useVault } from '../context/VaultContext';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { vaultState, setAppDisplayName, setLauncherIcon, toggleBiometrics, setVPNCountry, toggleVPN, toggleFakeMode, scanAndRestore, lockVault } = useVault();
  const [displayName, setDisplayName] = useState(vaultState.appDisplayName);
  const [vpnCountry, setVpnCountry] = useState(vaultState.vpnCountry);

  const handleDisplayNameSave = () => {
    setAppDisplayName(displayName);
    Alert.alert('Success', 'App display name updated');
  };

  const handleVPNCountrySave = () => {
    setVPNCountry(vpnCountry);
    Alert.alert('Success', 'VPN country updated');
  };

  const handleRestore = async () => {
    Alert.alert('Restore', 'This will scan your device for vault files. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Continue', 
        onPress: async () => {
          const result = await scanAndRestore();
          Alert.alert('Restore Complete', 
            `Found: ${result.found}\nRestored: ${result.restored}\nCorrupted: ${result.corrupted}`);
        }
      }
    ]);
  };

  const handleSelfDestruct = () => {
    Alert.alert('Self Destruct', 'This will permanently erase all vault data. This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Erase Everything', 
        style: 'destructive',
        onPress: () => {
          // TODO: Implement self destruct
          lockVault();
          navigation.navigate('Calculator');
        }
      }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Appearance</Text>
      
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Display Name</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter display name"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleDisplayNameSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Launcher Icon</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={styles.iconOption}>
            <Text style={styles.icon}>📱</Text>
            <Text style={styles.iconText}>Default</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconOption}>
            <Text style={styles.icon}>🧮</Text>
            <Text style={styles.iconText}>Calculator</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconOption}>
            <Text style={styles.icon}>📊</Text>
            <Text style={styles.iconText}>Charts</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <Text style={styles.sectionTitle}>Security</Text>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Change PIN</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Change PIN</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.switchRow}>
          <Text style={styles.settingLabel}>Biometric Unlock</Text>
          <Switch
            value={vaultState.biometricsEnabled}
            onValueChange={toggleBiometrics}
          />
        </View>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.switchRow}>
          <Text style={styles.settingLabel}>Fake/Decoy Mode</Text>
          <Switch
            value={vaultState.fakeMode}
            onValueChange={toggleFakeMode}
          />
        </View>
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Auto Lock Timer</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>{vaultState.autoLockTimer} seconds</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>VPN</Text>

      <View style={styles.settingItem}>
        <View style={styles.switchRow}>
          <Text style={styles.settingLabel}>Auto-connect VPN</Text>
          <Switch
            value={vaultState.vpnConnected}
            onValueChange={toggleVPN}
          />
        </View>
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>VPN Country</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={vpnCountry}
            onChangeText={setVpnCountry}
            placeholder="Country code (e.g., US)"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleVPNCountrySave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Data Management</Text>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Restore Vault Data</Text>
        <TouchableOpacity style={styles.button} onPress={handleRestore}>
          <Text style={styles.buttonText}>Scan and Restore</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Full Backup</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Create Backup</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Danger Zone</Text>

      <View style={styles.settingItem}>
        <Text style={[styles.settingLabel, styles.dangerText]}>Self Destruct</Text>
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleSelfDestruct}>
          <Text style={[styles.buttonText, styles.dangerButtonText]}>Erase All Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 20,
  },
  settingItem: {
    backgroundColor: '#2c2c2e',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#3a3a3c',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  iconOption: {
    alignItems: 'center',
    marginRight: 20,
  },
  icon: {
    fontSize: 30,
    marginBottom: 5,
  },
  iconText: {
    color: '#fff',
    fontSize: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#3a3a3c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  dangerText: {
    color: '#ff453a',
  },
  dangerButton: {
    backgroundColor: '#ff453a',
  },
  dangerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    height: 50,
  },
});

export default SettingsScreen;