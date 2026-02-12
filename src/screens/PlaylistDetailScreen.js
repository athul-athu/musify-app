import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { getPlaylistSongs, removeSongFromPlaylist } from '../services/playlistService';

export default function PlaylistDetailScreen({ route, navigation }) {
    const { playlist } = route.params;
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSongs();
    }, []);

    const fetchSongs = async () => {
        try {
            const data = await getPlaylistSongs(playlist.id);
            setSongs(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load songs');
        } finally {
            setLoading(false);
        }
    };

    const handlePlaySong = (index) => {
        navigation.navigate('Player', {
            song: songs[index],
            playlist: songs,
            startIndex: index
        });
    };

    const confirmRemoveSong = (songId) => {
        Alert.alert(
            'Remove Song',
            'Are you sure you want to remove this song from the playlist?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => handleRemoveSong(songId) }
            ]
        );
    };

    const handleRemoveSong = async (songId) => {
        try {
            await removeSongFromPlaylist(songId);
            setSongs(songs.filter(s => s.id !== songId));
        } catch (error) {
            Alert.alert('Error', 'Failed to remove song');
        }
    };

    const renderItem = ({ item, index }) => (
        <View style={styles.songItem}>
            <TouchableOpacity
                style={styles.songInfoContainer}
                onPress={() => handlePlaySong(index)}
            >
                <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                <View style={styles.songInfo}>
                    <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmRemoveSong(item.id)} style={styles.removeButton}>
                <Ionicons name="trash-outline" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
        </View>
    );

    return (
        <LinearGradient
            colors={[Colors.gradientStart, Colors.background]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>{playlist.name}</Text>
                    <View style={{ width: 24 }} />
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={songs}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No songs in this playlist yet.</Text>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        flex: 1,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
    },
    songItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: Colors.card,
        borderRadius: 8,
        padding: 10,
    },
    songInfoContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 4,
    },
    songInfo: {
        marginLeft: 15,
        flex: 1,
    },
    songTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    songArtist: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    removeButton: {
        padding: 10,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: 16,
    },
});
