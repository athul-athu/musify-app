import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const PLAYLISTS = [
    { id: '1', name: 'Top Hits 2024', count: '50 songs', cover: 'https://i1.sndcdn.com/artworks-9x50R7L3tK6t-0-t500x500.jpg' },
    { id: '2', name: 'Chill Vibes', count: '32 songs', cover: 'https://i1.sndcdn.com/artworks-Zq70pP8tT3zT-0-t500x500.jpg' },
    { id: '3', name: 'Workout Mix', count: '45 songs', cover: 'https://upload.wikimedia.org/wikipedia/en/e/e8/Taylor_Swift_-_Cruel_Summer.png' },
];

export default function PlaylistScreen() {
    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.itemContainer}>
            <Image source={{ uri: item.cover }} style={styles.cover} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.count}>{item.count}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <LinearGradient
            colors={[Colors.gradientStart, Colors.background]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <Text style={styles.header}>Your Library</Text>
                <FlatList
                    data={PLAYLISTS}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
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
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text,
        padding: 20,
    },
    list: {
        padding: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    cover: {
        width: 60,
        height: 60,
        borderRadius: 4,
    },
    info: {
        flex: 1,
        marginLeft: 15,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    count: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 4,
    },
});
