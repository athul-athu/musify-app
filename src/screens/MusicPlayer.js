import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import Colors from '../constants/Colors';

export default function MusicPlayer({ route, navigation }) {
    const { song } = route.params;
    const [sound, setSound] = useState();
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);

    async function playSound() {
        console.log('Loading Sound');
        try {
            const { sound } = await Audio.Sound.createAsync(
                { uri: song.url },
                { shouldPlay: true }
            );
            setSound(sound);
            setIsPlaying(true);
            setLoading(false);

            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    setIsPlaying(false);
                    // Optionally loop or go to next
                }
            });
        } catch (error) {
            console.error("Error loading sound", error);
            setLoading(false);
        }
    }

    useEffect(() => {
        playSound();
        return () => {
            console.log('Unloading Sound');
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [song]);

    async function togglePlayback() {
        if (!sound) return;
        if (isPlaying) {
            await sound.pauseAsync();
            setIsPlaying(false);
        } else {
            await sound.playAsync();
            setIsPlaying(true);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-down" size={30} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerText}>Now Playing</Text>
                <View style={{ width: 30 }} />
            </View>

            <View style={styles.artworkContainer}>
                <Image source={{ uri: song.artwork }} style={styles.artwork} />
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.title}>{song.title}</Text>
                <Text style={styles.artist}>{song.artist}</Text>
            </View>

            <View style={styles.controls}>
                {loading ? (
                    <ActivityIndicator size="large" color={Colors.primary} />
                ) : (
                    <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
                        <Ionicons name={isPlaying ? "pause" : "play"} size={40} color={Colors.black} />
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'space-between',
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    headerText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    artworkContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.44,
        shadowRadius: 10.32,
        elevation: 16,
    },
    artwork: {
        width: 300,
        height: 300,
        borderRadius: 8,
    },
    infoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: 5,
    },
    artist: {
        fontSize: 18,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40,
    },
    playButton: {
        width: 70,
        height: 70,
        backgroundColor: Colors.primary,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
