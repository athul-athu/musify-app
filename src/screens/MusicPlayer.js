import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudioPlayer } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import Colors from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function MusicPlayer({ route, navigation }) {
    const { song } = route.params;
    const player = useAudioPlayer(song.url);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Auto-play when component mounts
        if (player) {
            try {
                player.play();
                setLoading(false);
            } catch (error) {
                console.error('Error playing audio:', error);
                setLoading(false);
            }
        }

        return () => {
            // Cleanup when component unmounts
            if (player) {
                try {
                    player.pause();
                } catch (error) {
                    console.error('Error pausing audio:', error);
                }
            }
        };
    }, [song.url]);

    const togglePlayback = () => {
        if (!player) return;

        try {
            if (player.playing) {
                player.pause();
            } else {
                player.play();
            }
        } catch (error) {
            console.error('Error toggling playback:', error);
        }
    };

    const handleSeek = (value) => {
        if (player) {
            player.seekTo(value);
        }
    };

    return (
        <LinearGradient
            colors={[Colors.gradientStart, Colors.background]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-down" size={32} color={Colors.text} />
                </TouchableOpacity>

                <View style={styles.artworkContainer}>
                    <Image source={{ uri: song.artwork }} style={styles.artwork} />
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.title}>{song.title}</Text>
                    <Text style={styles.artist}>{song.artist}</Text>
                </View>

                <View style={styles.progressContainer}>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={player.duration || 100}
                        value={player.currentTime || 0}
                        onSlidingComplete={handleSeek}
                        minimumTrackTintColor={Colors.primary}
                        maximumTrackTintColor={Colors.textSecondary}
                        thumbTintColor={Colors.primary}
                    />
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>
                            {formatTime(player.currentTime || 0)}
                        </Text>
                        <Text style={styles.timeText}>
                            {formatTime(player.duration || 0)}
                        </Text>
                    </View>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity>
                        <Ionicons name="play-skip-back" size={40} color={Colors.text} />
                    </TouchableOpacity>

                    {loading ? (
                        <ActivityIndicator size="large" color={Colors.primary} />
                    ) : (
                        <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
                            <Ionicons
                                name={player.playing ? "pause-circle" : "play-circle"}
                                size={80}
                                color={Colors.primary}
                            />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity>
                        <Ionicons name="play-skip-forward" size={40} color={Colors.text} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 20,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginTop: 10,
    },
    artworkContainer: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 40,
    },
    artwork: {
        width: 300,
        height: 300,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    infoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 8,
    },
    artist: {
        fontSize: 18,
        color: Colors.textSecondary,
    },
    progressContainer: {
        marginBottom: 30,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    timeText: {
        color: Colors.textSecondary,
        fontSize: 12,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    playButton: {
        marginHorizontal: 20,
    },
});
