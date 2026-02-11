import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function UserDetailsScreen({ navigation }) {
    const { userProfile, signOut, loading } = useAuth();

    if (loading) {
        return (
            <LinearGradient colors={[Colors.gradientStart, Colors.background]} style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </SafeAreaView>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={[Colors.gradientStart, Colors.background]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            {userProfile?.avatar_url ? (
                                <Image source={{ uri: userProfile.avatar_url }} style={styles.avatar} />
                            ) : (
                                <Ionicons name="person" size={60} color={Colors.white} />
                            )}
                        </View>
                        <Text style={styles.username}>{userProfile?.full_name || 'User'}</Text>
                        <Text style={styles.email}>{userProfile?.email || 'No email'}</Text>

                        {/* Additional Profile Info */}
                        {userProfile?.dob && (
                            <View style={styles.infoRow}>
                                <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                                <Text style={styles.infoText}>DOB: {userProfile.dob}</Text>
                            </View>
                        )}
                        {userProfile?.age && (
                            <View style={styles.infoRow}>
                                <Ionicons name="person-outline" size={16} color={Colors.textSecondary} />
                                <Text style={styles.infoText}>Age: {userProfile.age}</Text>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditProfile')}>
                        <Ionicons name="create-outline" size={18} color={Colors.text} style={{ marginRight: 8 }} />
                        <Text style={styles.buttonText}>Edit Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, styles.signOutButton]} onPress={signOut}>
                        <Ionicons name="log-out-outline" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
                        <Text style={[styles.buttonText, { color: Colors.primary }]}>Sign Out</Text>
                    </TouchableOpacity>
                </ScrollView>
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 30,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.card,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: Colors.primary,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 5,
    },
    email: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginLeft: 8,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: Colors.textSecondary,
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 25,
        marginTop: 15,
        minWidth: 200,
    },
    signOutButton: {
        borderColor: Colors.primary,
        marginTop: 20,
    },
    buttonText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
});
