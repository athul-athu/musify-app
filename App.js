import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { setAudioModeAsync } from 'expo-audio';
import { PlayerProvider } from './src/context/PlayerContext';

export default function App() {
  useEffect(() => {
    async function setupAudio() {
      try {
        await setAudioModeAsync({
          staysActiveInBackground: true,
          interruptionModeIOS: 'doNotMix',
          playsInSilentModeIOS: true,
          shouldRouteAudioToBluetoothApi: true,
          interruptionModeAndroid: 'doNotMix',
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
      <PlayerProvider>
        <AppNavigator />
      </PlayerProvider>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
