import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { Audio } from 'expo-av';

export default function App() {
  useEffect(() => {
    async function setupAudio() {
      try {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          allowsRecordingIOS: false,
          interruptionModeIOS: 1, // InterruptionModeIOS.DoNotMix
          playsInSilentModeIOS: true,
          shouldRouteAudioToBluetoothApiAD: true,
          interruptionModeAndroid: 1, // InterruptionModeAndroid.DoNotMix
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.log('Error setting up audio mode:', error);
      }
    }
    setupAudio();
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
