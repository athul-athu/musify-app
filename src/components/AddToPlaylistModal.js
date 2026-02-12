import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { getUserPlaylists, addSongToPlaylist, createPlaylist } from '../services/playlistService';

export default function AddToPlaylistModal({ visible, onClose, song }) {
    const { session } = useAuth();
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false); // To toggle create mode if we want, for now just simple list

    useEffect(() => {
        if (visible && session?.user) {
            fetchPlaylists();
        }
    }, [visible, session]);

    const fetchPlaylists = async () => {
        setLoading(true);
        try {
            const data = await getUserPlaylists(session.user.id);
            setPlaylists(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load playlists');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToPlaylist = async (playlist) => {
        try {
            await addSongToPlaylist(playlist.id, song);
            Alert.alert('Success', `Added to ${playlist.name}`);
            onClose();
        } catch (error) {
            Alert.alert('Error', 'Failed to add song to playlist');
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Add to Playlist</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={Colors.text} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.songTitle} numberOfLines={1}>
                        {song?.title}
                    </Text>

                    {loading ? (
                        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
                    ) : (
                        <FlatList
                            data={playlists}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No playlists found. Create one in the Library tab.</Text>
                            }
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.playlistItem}
                                    onPress={() => handleAddToPlaylist(item)}
                                >
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="musical-notes" size={24} color={Colors.textSecondary} />
                                    </View>
                                    <Text style={styles.playlistName}>{item.name}</Text>
                                    <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.card,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '70%',
        minHeight: 300,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    songTitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 20,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 20,
    },
    playlistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 4,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    playlistName: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
    emptyText: {
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 20,
    },
});
