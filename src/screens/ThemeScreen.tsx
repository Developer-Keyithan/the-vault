// src/screens/ThemeScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Slider } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useVault } from '../context/VaultContext';

type ThemeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Theme'>;

interface Props {
  navigation: ThemeScreenNavigationProp;
}

const ThemeScreen: React.FC<Props> = ({ navigation }) => {
  const { vaultState, setTheme } = useVault();

  const accentColors = [
    '#007AFF', '#34C759', '#FF9500', '#FF2D55', '#5856D6', '#AF52DE', '#FFCC00', '#5AC8FA'
  ];

  const iconShapes = [
    { id: 'circle', name: 'Circle', icon: '⭕' },
    { id: 'square', name: 'Square', icon: '◼️' },
    { id: 'rounded', name: 'Rounded', icon: '🔲' }
  ];

  const handleAccentColorSelect = (color: string) => {
    setTheme({ accentColor: color });
  };

  const handleIconShapeSelect = (shape: string) => {
    setTheme({ iconShape: shape as any });
  };

  const handleBlurChange = (value: number) => {
    setTheme({ blurIntensity: value });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Accent Color</Text>
      <View style={styles.colorsGrid}>
        {accentColors.map(color => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              vaultState.currentTheme.accentColor === color && styles.colorSelected
            ]}
            onPress={() => handleAccentColorSelect(color)}
          >
            {vaultState.currentTheme.accentColor === color && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Icon Shape</Text>
      <View style={styles.shapesGrid}>
        {iconShapes.map(shape => (
          <TouchableOpacity
            key={shape.id}
            style={[
              styles.shapeOption,
              vaultState.currentTheme.iconShape === shape.id && styles.shapeSelected
            ]}
            onPress={() => handleIconShapeSelect(shape.id)}
          >
            <Text style={styles.shapeIcon}>{shape.icon}</Text>
            <Text style={styles.shapeName}>{shape.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Blur Intensity</Text>
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderValue}>{vaultState.currentTheme.blurIntensity}px</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={20}
          step={1}
          value={vaultState.currentTheme.blurIntensity}
          onValueChange={handleBlurChange}
          minimumTrackTintColor={vaultState.currentTheme.accentColor}
          maximumTrackTintColor="#3a3a3c"
        />
      </View>

      <View style={styles.preview}>
        <Text style={styles.previewTitle}>Preview</Text>
        <View style={styles.previewIcons}>
          <View style={[
            styles.previewIcon,
            { 
              backgroundColor: vaultState.currentTheme.accentColor,
              borderRadius: 
                vaultState.currentTheme.iconShape === 'circle' ? 30 :
                vaultState.currentTheme.iconShape === 'rounded' ? 15 : 0
            }
          ]}>
            <Text style={styles.previewIconText}>📱</Text>
          </View>
          <View style={[
            styles.previewIcon,
            { 
              backgroundColor: vaultState.currentTheme.accentColor,
              borderRadius: 
                vaultState.currentTheme.iconShape === 'circle' ? 30 :
                vaultState.currentTheme.iconShape === 'rounded' ? 15 : 0
            }
          ]}>
            <Text style={styles.previewIconText}>🌐</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    padding: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  checkmark: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  shapesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shapeOption: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2c2c2e',
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  shapeSelected: {
    backgroundColor: '#007AFF',
  },
  shapeIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  shapeName: {
    color: '#fff',
    fontSize: 14,
  },
  sliderContainer: {
    backgroundColor: '#2c2c2e',
    padding: 20,
    borderRadius: 10,
  },
  sliderValue: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  preview: {
    backgroundColor: '#2c2c2e',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 40,
  },
  previewTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  previewIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  previewIcon: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewIconText: {
    fontSize: 24,
  },
});

export default ThemeScreen;