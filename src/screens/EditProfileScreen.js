import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function EditProfileScreen({ navigation }) {
    const { userProfile, session, refreshProfile } = useAuth();
    const [name, setName] = useState(userProfile?.full_name || '');
    const [image, setImage] = useState(userProfile?.avatar_url || null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setName(userProfile.full_name);
            setImage(userProfile.avatar_url);
        }
    }, [userProfile]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleUpdate = async () => {
        if (!name) {
            Alert.alert("Error", "Name cannot be empty");
            return;
        }

        setLoading(true);
        try {
            let avatarUrl = image;

            // Only upload if image changed (starts with file://)
            if (image && image.startsWith('file://')) {
                const ext = image.substring(image.lastIndexOf('.') + 1);
                const fileName = `${session.user.id}.${ext}`;
                const formData = new FormData();
                formData.append('files', {
                    uri: image,
                    name: fileName,
                    type: `image/${ext}`
                });

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, formData, {
                        contentType: `image/${ext}`,
                        upsert: true
                    });

                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
                avatarUrl = data.publicUrl;
            }

            const { error } = await supabase
                .from('profiles')
                .update({ full_name: name, avatar_url: avatarUrl })
                .eq('id', session.user.id);

            if (error) throw error;

            // Refresh the profile data
            await refreshProfile(session.user.id);

            Alert.alert("Success", "Profile updated!");
            navigation.goBack();

        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={[Colors.gradientStart, Colors.background]} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <Ionicons name="camera" size={40} color={Colors.textSecondary} />
                            </View>
                        )}
                        <Text style={styles.changePhotoText}>Change Photo</Text>
                    </TouchableOpacity>

                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                        placeholder="Full Name"
                        placeholderTextColor={Colors.textSecondary}
                    />

                    <TouchableOpacity style={styles.saveButton} onPress={handleUpdate} disabled={loading}>
                        {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
    content: { padding: 20, alignItems: 'center' },
    imagePicker: { alignItems: 'center', marginBottom: 30 },
    profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: Colors.primary },
    placeholderImage: {
        width: 120, height: 120, borderRadius: 60,
        backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: Colors.textSecondary, borderStyle: 'dashed'
    },
    changePhotoText: { color: Colors.primary, marginTop: 10, fontSize: 16 },
    label: { alignSelf: 'flex-start', color: Colors.textSecondary, marginBottom: 5, marginLeft: 5 },
    input: {
        width: '100%', backgroundColor: Colors.card, color: Colors.text,
        padding: 15, borderRadius: 8, marginBottom: 20, fontSize: 16
    },
    saveButton: {
        width: '100%', backgroundColor: Colors.primary, padding: 15, borderRadius: 30,
        alignItems: 'center', marginTop: 10
    },
    saveButtonText: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },
});
