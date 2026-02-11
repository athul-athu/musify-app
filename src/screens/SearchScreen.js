import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';

// YouTube Data API v3 Configuration
const YOUTUBE_API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

export default function SearchScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPlayingId, setCurrentPlayingId] = useState(null);

    const searchYouTube = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `${YOUTUBE_API_URL}?part=snippet&q=${encodeURIComponent(query + ' music')}&type=video&videoCategoryId=10&maxResults=20&key=${YOUTUBE_API_KEY}`
            );

            const data = await response.json();

            if (data.error) {
                Alert.alert('Error', data.error.message);
                setSearchResults([]);
                return;
            }

            const results = data.items
                .filter(item => item.id?.videoId) // Filter out items without videoId
                .map(item => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    author: item.snippet.channelTitle,
                    thumbnail: item.snippet.thumbnails.medium.url,
                }));

            setSearchResults(results);
        } catch (error) {
            console.error('YouTube search error:', error);
            Alert.alert('Error', 'Failed to search YouTube. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text.length > 2) {
            searchYouTube(text);
        } else {
            setSearchResults([]);
        }
    };

    const handlePlayPreview = (videoId) => {
        const songData = searchResults.find(r => r.id === videoId);

        navigation.navigate('Player', {
            song: {
                id: videoId,
                videoId: videoId,
                title: songData?.title,
                artist: songData?.author,
                artwork: songData?.thumbnail,
            }
        });
    };

    const renderSearchResult = ({ item }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handlePlayPreview(item.id)}
        >
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={styles.resultInfo}>
                <Text style={styles.resultTitle} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={styles.resultAuthor} numberOfLines={1}>
                    {item.author}
                </Text>
            </View>
            <Ionicons name="play-circle" size={32} color={Colors.primary} />
        </TouchableOpacity>
    );

    return (
        <LinearGradient
            colors={[Colors.gradientStart, Colors.background]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.searchHeader}>
                    <Text style={styles.header}>Search Music</Text>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color={Colors.black} />
                        <TextInput
                            placeholder="Search for songs, artists..."
                            placeholderTextColor="#555"
                            style={styles.input}
                            value={searchQuery}
                            onChangeText={handleSearch}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => {
                                setSearchQuery('');
                                setSearchResults([]);
                            }}>
                                <Ionicons name="close-circle" size={20} color="#555" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.loadingText}>Searching...</Text>
                    </View>
                ) : searchResults.length > 0 ? (
                    <FlatList
                        data={searchResults}
                        renderItem={renderSearchResult}
                        keyExtractor={(item, index) => item.id || index.toString()}
                        contentContainerStyle={styles.resultsList}
                        showsVerticalScrollIndicator={false}
                    />
                ) : searchQuery.length > 0 ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="musical-notes-outline" size={64} color={Colors.textSecondary} />
                        <Text style={styles.emptyText}>No results found</Text>
                        <Text style={styles.emptySubtext}>Try a different search term</Text>
                    </View>
                ) : (
                    <View style={styles.centerContainer}>
                        <Ionicons name="search-outline" size={64} color={Colors.textSecondary} />
                        <Text style={styles.emptyText}>Search for music</Text>
                        <Text style={styles.emptySubtext}>Find your favorite songs and artists</Text>
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
    searchHeader: {
        padding: 20,
        paddingBottom: 10,
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 15,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 45,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: Colors.black,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: Colors.text,
    },
    emptyText: {
        marginTop: 20,
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    emptySubtext: {
        marginTop: 8,
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    resultsList: {
        padding: 20,
        paddingTop: 10,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    thumbnail: {
        width: 80,
        height: 80,
        borderRadius: 6,
        backgroundColor: Colors.background,
    },
    resultInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 10,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    resultAuthor: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
});
