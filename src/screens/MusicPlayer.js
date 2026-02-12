import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { usePlayer } from '../context/PlayerContext';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

const { width } = Dimensions.get('window');

export default function MusicPlayer({ navigation }) {
    const {
        currentSong,
        playing,
        togglePlay,
        playNext,
        playPrevious,
        currentTime,
        duration,
        seekTo,
        loading,
        currentIndex,
        playlist
    } = usePlayer();

    const [modalVisible, setModalVisible] = useState(false);
    const [isSeeking, setIsSeeking] = useState(false);
    const [seekValue, setSeekValue] = useState(0);

    if (!currentSong) return null;

    const handleSeek = (value) => {
        setSeekValue(value);
    };

    const handleSlidingStart = () => {
        setIsSeeking(true);
    };

    const handleSlidingComplete = (value) => {
        seekTo(value);
        setIsSeeking(false);
    };

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
                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                    )}
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.title} numberOfLines={2}>{currentSong.title}</Text>
                    <Text style={styles.artist}>{currentSong.artist || 'Unknown Artist'}</Text>
                </View>

                <View style={styles.progressContainer}>
                    <Slider
                        style={styles.slider}
                        value={isSeeking ? seekValue : currentTime}
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
                            {formatTime(isSeeking ? seekValue : currentTime)}
                        </Text>
                        <Text style={styles.timeText}>
                            {formatTime(duration)}
                        </Text>
                    </View>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity
                        onPress={playPrevious}
                        disabled={!playlist || currentIndex === 0}
                    >
                        <Ionicons
                            name="play-skip-back"
                            size={35}
                            color={(!playlist || currentIndex === 0) ? Colors.textSecondary : Colors.text}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={togglePlay} style={styles.playButton}>
                        <Ionicons
                            name={playing ? "pause-circle" : "play-circle"}
                            size={80}
                            color={Colors.primary}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={playNext}
                        disabled={!playlist || currentIndex === playlist.length - 1}
                    >
                        <Ionicons
                            name="play-skip-forward"
                            size={35}
                            color={(!playlist || currentIndex === playlist.length - 1) ? Colors.textSecondary : Colors.text}
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={styles.playlistButton}
                >
                    <Ionicons name="add-circle-outline" size={35} color={Colors.textSecondary} />
                </TouchableOpacity>

                <AddToPlaylistModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    song={currentSong}
                />
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
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
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
    playlistButton: {
        position: 'absolute',
        bottom: 225,
        right: 35,
    },
});
