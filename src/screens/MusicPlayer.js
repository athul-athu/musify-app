import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import YoutubePlayer from 'react-native-youtube-iframe';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

export default function MusicPlayer({ route, navigation }) {
    const { song } = route.params;
    const playerRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);

    const onStateChange = useCallback((state) => {
        if (state === 'ended') {
            setPlaying(false);
            setCurrentTime(0);
        } else if (state === 'buffering') {
            setLoading(true);
        } else if (state === 'playing') {
            setLoading(false);
        }
    }, []);

    const togglePlayback = useCallback(() => {
        console.log("Play/Pause Toggled");
        setPlaying((prev) => !prev);
    }, []);

    const onReady = useCallback(async () => {
        console.log("Player Ready!");
        setLoading(false);
        setPlaying(true);
        if (playerRef.current) {
            const d = await playerRef.current.getDuration();
            if (d) setDuration(d);
        }
    }, []);

    // Poll for current time since YoutubePlayer doesn't support onProgress prop directly
    useEffect(() => {
        const interval = setInterval(async () => {
            if (playing && !loading && !isSeeking && playerRef.current) {
                try {
                    const time = await playerRef.current.getCurrentTime();
                    const dur = await playerRef.current.getDuration();
                    if (time) setCurrentTime(time);
                    if (dur) setDuration(dur);
                } catch (e) {
                    // Ignore errors
                }
            }
        }, 500);
        return () => clearInterval(interval);
    }, [playing, loading, isSeeking]);

    const handleSeek = useCallback((value) => {
        setCurrentTime(value);
    }, []);

    const handleSlidingStart = useCallback(() => {
        setIsSeeking(true);
    }, []);

    const handleSlidingComplete = useCallback((value) => {
        if (playerRef.current) {
            playerRef.current.seekTo(value, true);
            // Ensure playback resumes if it was playing
            setPlaying(true);
        }
        setIsSeeking(false);
    }, []);

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
                    {/* Hidden Player that is technically visible (1px) to prevent OS throttling */}
                    <View style={styles.hiddenPlayer}>
                        <YoutubePlayer
                            ref={playerRef}
                            height={1}
                            width={1}
                            play={playing}
                            videoId={song.videoId || song.id}
                            onChangeState={onStateChange}
                            onReady={onReady}
                            onError={(e) => console.log('Player Error:', e)}
                            contentScale={0.5}
                            initialPlayerParams={{
                                preventFullScreen: true,
                                modestbranding: true,
                                controls: false,
                                rel: 0,
                            }}
                        />
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.title} numberOfLines={2}>{song.title}</Text>
                    <Text style={styles.artist}>{song.artist}</Text>
                </View>

                <View style={styles.progressContainer}>
                    <Slider
                        style={styles.slider}
                        value={currentTime}
                        minimumValue={0}
                        maximumValue={duration > 0 ? duration : 1}
                        minimumTrackTintColor={Colors.primary}
                        maximumTrackTintColor={Colors.textSecondary}
                        thumbTintColor={Colors.primary}
                        onValueChange={handleSeek}
                        onSlidingStart={handleSlidingStart}
                        onSlidingComplete={handleSlidingComplete}
                    />
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>
                            {formatTime(currentTime)}
                        </Text>
                        <Text style={styles.timeText}>
                            {formatTime(duration)}
                        </Text>
                    </View>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
                        <Ionicons
                            name={playing ? "pause-circle" : "play-circle"}
                            size={80}
                            color={Colors.primary}
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
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
        zIndex: 10,
    },
    artworkContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
        position: 'relative',
    },
    artwork: {
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    hiddenPlayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: 1,
        width: 1,
        opacity: 0.01, // Visible but essentially invisible
    },
    infoContainer: {
        alignItems: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    artist: {
        fontSize: 18,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    progressContainer: {
        marginBottom: 30,
        width: '100%',
    },
    slider: {
        width: '100%',
        height: 40,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginTop: -5,
    },
    timeText: {
        color: Colors.textSecondary,
        fontSize: 12,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    playButton: {
        marginHorizontal: 20,
    },
});
