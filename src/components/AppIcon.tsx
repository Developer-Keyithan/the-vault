// src/components/AppIcon.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

interface App {
  id: string;
  name: string;
  icon: string;
  screen: string;
  color: string;
}

interface Props {
  app: App;
  index: number;
  jiggleMode: boolean;
  onPress: (app: App) => void;
  onLongPress: () => void;
  onRearrange: (fromIndex: number, toIndex: number) => void;
}

const AppIcon: React.FC<Props> = ({ app, index, jiggleMode, onPress, onLongPress, onRearrange }) => {
  const translateX = new Animated.Value(0);
  const translateY = new Animated.Value(0);
  const scale = new Animated.Value(1);

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      // Handle drag end
      translateX.setValue(0);
      translateY.setValue(0);
    }
  };

  const animatedStyle = {
    transform: [
      { translateX },
      { translateY },
      { scale: jiggleMode ? scale : new Animated.Value(1) },
    ],
  };

  React.useEffect(() => {
    if (jiggleMode) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.9,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scale.setValue(1);
    }
  }, [jiggleMode, scale]);

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      enabled={jiggleMode}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <TouchableOpacity
          style={[styles.iconContainer, { backgroundColor: app.color }]}
          onPress={() => onPress(app)}
          onLongPress={onLongPress}
          delayLongPress={500}
        >
          <Text style={styles.icon}>{app.icon}</Text>
        </TouchableOpacity>
        <Text style={styles.name}>{app.name}</Text>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 80,
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  icon: {
    fontSize: 24,
  },
  name: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default AppIcon;