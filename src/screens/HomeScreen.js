import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getRecentSearches } from '../services/searchService';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayer } from '../context/PlayerContext';

export default function HomeScreen({ navigation }) {
    const { playSong } = usePlayer();
    const { session } = useAuth();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchRecentSongs();
        }, [session])
    );

    const fetchRecentSongs = async () => {
        if (!session?.user?.id) {
            setLoading(false);
            return;
        }

        try {
            const recent = await getRecentSearches(session.user.id);
            setSongs(recent);
        } catch (error) {
            console.error('Error fetching recent songs:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => {
                playSong(item, songs, songs.indexOf(item));
                navigation.navigate('Player');
            }}
        >
            <Image source={{ uri: item.artwork }} style={styles.artwork} />
            <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.artist}>{item.artist || 'Unknown Artist'}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <LinearGradient
            colors={[Colors.gradientStart, Colors.background]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
                <Text style={styles.headerTitle}>Recent Search</Text>

                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : songs.length > 0 ? (
                    <FlatList
                        data={songs}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.centerContainer}>
                        <Text style={styles.emptyText}>No recent searches found</Text>
                        <Text style={styles.emptySubtext}>Try searching for some music first!</Text>
                    </View>
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
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.text,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: Colors.card,
        borderRadius: 8,
        padding: 10,
    },
    artwork: {
        width: 60,
        height: 60,
        borderRadius: 4,
    },
    infoContainer: {
        marginLeft: 15,
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    artist: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 4,
    },
});
