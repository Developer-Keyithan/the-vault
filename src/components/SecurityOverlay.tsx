// src/components/SecurityOverlay.tsx
import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSecurityContext } from '../utils/security';

interface SecurityOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export const SecurityOverlay: React.FC<SecurityOverlayProps> = ({ visible, onClose }) => {
  const { securityBreach, isCompromised, getSecurityLogs, resetSecurityBreach } = useSecurityContext();
  const securityLogs = getSecurityLogs();

  const handleAcknowledge = () => {
    resetSecurityBreach();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <Text style={styles.alertTitle}>Security Alert</Text>
          
          {securityBreach && (
            <View style={styles.breachInfo}>
              <Text style={styles.breachText}>
                {securityBreach === 'device_compromised' 
                  ? 'Potential security issue detected with your device.'
                  : 'Suspicious activity detected.'
                }
              </Text>
            </View>
          )}

          {isCompromised && (
            <View style={styles.warning}>
              <Text style={styles.warningText}>
                ⚠️ Your device may be compromised. For maximum security, consider using a different device.
              </Text>
            </View>
          )}

          <ScrollView style={styles.logsContainer}>
            <Text style={styles.logsTitle}>Recent Security Events:</Text>
            {securityLogs.slice(-5).map((log, index) => (
              <View key={index} style={styles.logEntry}>
                <Text style={styles.logTime}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </Text>
                <Text style={styles.logMessage}>{log.message}</Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.acknowledgeButton} onPress={handleAcknowledge}>
            <Text style={styles.acknowledgeText}>Acknowledge & Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.lockButton} onPress={onClose}>
            <Text style={styles.lockText}>Lock Vault Immediately</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: '#1c1c1e',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  alertTitle: {
    color: '#ff453a',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  breachInfo: {
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  breachText: {
    color: '#ff453a',
    fontSize: 16,
    textAlign: 'center',
  },
  warning: {
    backgroundColor: 'rgba(255, 204, 0, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  warningText: {
    color: '#ffcc00',
    fontSize: 14,
    textAlign: 'center',
  },
  logsContainer: {
    maxHeight: 200,
    marginBottom: 20,
  },
  logsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logEntry: {
    backgroundColor: '#2c2c2e',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  logTime: {
    color: '#8e8e93',
    fontSize: 12,
    marginBottom: 2,
  },
  logMessage: {
    color: '#fff',
    fontSize: 14,
  },
  acknowledgeButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  acknowledgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lockButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff453a',
  },
  lockText: {
    color: '#ff453a',
    fontSize: 16,
    fontWeight: 'bold',
  },
});