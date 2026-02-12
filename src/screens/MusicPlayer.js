import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import YoutubePlayer from 'react-native-youtube-iframe';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

import AddToPlaylistModal from '../components/AddToPlaylistModal';

export default function MusicPlayer({ route, navigation }) {
    const { song, playlist, startIndex } = route.params;
    const playerRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Queue state
    const [currentIndex, setCurrentIndex] = useState(startIndex !== undefined ? startIndex : 0);
    const [currentSong, setCurrentSong] = useState(song);

    useEffect(() => {
        if (playlist && startIndex !== undefined) {
            setCurrentSong(playlist[currentIndex]);
        }
    }, [currentIndex, playlist]);

    // Reset state when song changes
    useEffect(() => {
        setLoading(true);
        setCurrentTime(0);
        setDuration(0);
        setPlaying(true);
    }, [videoId]); // Use videoId as the trigger for reset

    const playNext = useCallback(() => {
        if (playlist && playlist.length > 0) {
            console.log("Advancing to next song...");
            setCurrentTime(0);
            setDuration(0);
            if (currentIndex < playlist.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                console.log("Looping back to start of playlist");
                setCurrentIndex(0);
            }
        }
    }, [currentIndex, playlist]);

    // NEW: Explicitly control playback via Ref methods for maximal reliability
    useEffect(() => {
        if (playerRef.current) {
            if (playing) {
                console.log("Forcing Play via Ref...");
                playerRef.current.playVideo?.();
            } else {
                console.log("Forcing Pause via Ref...");
                playerRef.current.pauseVideo?.();
            }
        }
    }, [playing]);

    const playPrevious = useCallback(() => {
        if (playlist && playlist.length > 0) {
            setCurrentTime(0);
            setDuration(0);
            if (currentIndex > 0) {
                setCurrentIndex(prev => prev - 1);
            } else {
                console.log("Looping back to end of playlist");
                setCurrentIndex(playlist.length - 1);
            }
        }
    }, [currentIndex, playlist]);

    const onStateChange = useCallback((state) => {
        console.log("YouTube State:", state);
        if (state === 'ended') {
            if (playlist) {
                playNext();
            } else {
                setPlaying(false);
                setCurrentTime(0);
            }
        } else if (state === 'buffering') {
            setLoading(true);
        } else if (state === 'playing') {
            setLoading(false);
            setPlaying(true); // Sync internal state back to external
        } else if (state === 'paused') {
            // Only set playing false if we are not in a loading/seeking state
            // to prevent flickering on start
            if (!loading) setPlaying(false);
        }
    }, [currentIndex, playlist, playNext, loading]);

    const togglePlayback = useCallback(() => {
        setPlaying(prev => !prev);
    }, []);

    const onReady = useCallback(async () => {
        console.log("Player Ready for:", videoId);
        setLoading(false);

        if (playerRef.current) {
            try {
                // If this is a fresh song (time is near 0), kickstart it forcefully
                if (currentTime < 1) {
                    console.log("Forceful kickstart at 0...");
                    playerRef.current.seekTo(0, true);
                }
                const d = await playerRef.current.getDuration();
                if (d) setDuration(d);
            } catch (e) {
                console.log("Ready Error:", e);
            }
        }
    }, [videoId, currentTime]);

    // Poll for current time
    useEffect(() => {
        const interval = setInterval(async () => {
            if (playing && !loading && !isSeeking && playerRef.current) {
                try {
                    const time = await playerRef.current.getCurrentTime();
                    const dur = await playerRef.current.getDuration();
                    if (time !== undefined) {
                        setCurrentTime(time);
                    }
                    if (dur) setDuration(dur);
                } catch (e) {
                    // Ignore errors
                }
            }
        }, 1000);
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
            setPlaying(true);
        }
        setIsSeeking(false);
    }, []);

    // Helper to get video ID and artwork regardless of source object structure
    if (!currentSong) return null;

    const videoId = currentSong.videoId || currentSong.video_id || currentSong.id;
    const artwork = currentSong.artwork || currentSong.thumbnail;

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
                    <Image source={{ uri: artwork }} style={styles.artwork} />
                    <View style={styles.visibleHiddenPlayer}>
                        <YoutubePlayer
                            key={videoId} // Reset player instance ONLY when song changes
                            ref={playerRef}
                            height={100}
                            width={100}
                            play={playing}
                            videoId={videoId}
                            onChangeState={onStateChange}
                            onReady={onReady}
                            onError={(e) => console.log('Player Error:', e)}
                            contentScale={0.5}
                            webViewProps={{
                                allowsInlineMediaPlayback: true,
                                mediaPlaybackRequiresUserAction: false,
                                androidLayerType: 'hardware',
                                opacity: 0.99,
                                allowsBackgroundMediaPlayback: true,
                            }}
                            initialPlayerParams={{
                                preventFullScreen: true,
                                modestbranding: true,
                                controls: false,
                                rel: 0,
                                start: Math.floor(currentTime),
                            }}
                        />
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.title} numberOfLines={2}>{currentSong.title}</Text>
                    <Text style={styles.artist}>{currentSong.artist}</Text>
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
                    {playlist ? (
                        <TouchableOpacity onPress={playPrevious} disabled={currentIndex === 0}>
                            <Ionicons name="play-skip-back" size={35} color={currentIndex === 0 ? Colors.textSecondary : Colors.text} />
                        </TouchableOpacity>
                    ) : null}

                    <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
                        <Ionicons
                            name={playing ? "pause-circle" : "play-circle"}
                            size={80}
                            color={Colors.primary}
                        />
                    </TouchableOpacity>

                    {playlist ? (
                        <TouchableOpacity onPress={playNext} disabled={currentIndex === playlist.length - 1}>
                            <Ionicons name="play-skip-forward" size={35} color={currentIndex === playlist.length - 1 ? Colors.textSecondary : Colors.text} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.playlistButton}>
                            <Ionicons name="add-circle-outline" size={35} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {!playlist && (
                    <AddToPlaylistModal
                        visible={modalVisible}
                        onClose={() => setModalVisible(false)}
                        song={currentSong}
                    />
                )}
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
    visibleHiddenPlayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: 100,
        width: 100,
        zIndex: -1,
        opacity: 0.01,
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
