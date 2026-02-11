import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';

const SONGS = [
    {
        id: '1',
        videoId: 'dzqCNWj51wE', // Lose Control
        title: 'Lose Control',
        artist: 'Teddy Swims',
        artwork: 'https://i1.sndcdn.com/artworks-9x50R7L3tK6t-0-t500x500.jpg',
    },
    {
        id: '2',
        videoId: 'Oa_RSwwpPaA', // Beautiful Things
        title: 'Beautiful Things',
        artist: 'Benson Boone',
        artwork: 'https://i1.sndcdn.com/artworks-Zq70pP8tT3zT-0-t500x500.jpg',
    },
    {
        id: '3',
        videoId: 'ic8j13piAhQ', // Cruel Summer
        title: 'Cruel Summer',
        artist: 'Taylor Swift',
        artwork: 'https://upload.wikimedia.org/wikipedia/en/e/e8/Taylor_Swift_-_Cruel_Summer.png',
    },
];

import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen({ navigation }) {
    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => navigation.navigate('Player', { song: item })}
        >
            <Image source={{ uri: item.artwork }} style={styles.artwork} />
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.artist}>{item.artist}</Text>
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
                <Text style={styles.headerTitle}>Musify</Text>
                <FlatList
                    data={SONGS}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                />
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
