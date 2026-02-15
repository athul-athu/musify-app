import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

const MiniPlayer = () => {
    const navigation = useNavigation();
    const { currentSong, playing, togglePlay, playNext } = usePlayer();

    if (!currentSong) return null;

    const artwork = currentSong.artwork || currentSong.thumbnail;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Player', { song: currentSong })}
            style={styles.container}
        >
            <Image source={{ uri: artwork }} style={styles.thumbnail} />

            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
                <Text style={styles.artist} numberOfLines={1}>{currentSong.artist || 'Unknown Artist'}</Text>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity onPress={togglePlay} style={styles.controlButton}>
                    <Ionicons
                        name={playing ? "pause" : "play"}
                        size={30}
                        color={Colors.primary}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={playNext} style={styles.controlButton}>
                    <Ionicons name="play-forward" size={28} color={Colors.text} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 60, // Above bottom tabs
        left: 10,
        right: 10,
        height: 60,
        backgroundColor: Colors.tabBar,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: Colors.border,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    thumbnail: {
        width: 45,
        height: 45,
        borderRadius: 6,
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        color: Colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
    artist: {
        color: Colors.textSecondary,
        fontSize: 12,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    controlButton: {
        padding: 5,
        marginLeft: 5,
    },
});

export default MiniPlayer;
