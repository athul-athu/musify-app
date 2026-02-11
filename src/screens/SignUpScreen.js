import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { supabase } from '../lib/supabase';

export default function SignUpScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [dob, setDob] = useState('');
    const [age, setAge] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

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

    const handleSignUp = async () => {
        if (!name || !email || !dob || !age || !password || !confirmPassword || !image) {
            Alert.alert("Missing Information", "Please fill all fields and select a profile image.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Password Mismatch", "Passwords do not match. Please try again.");
            return;
        }

        setLoading(true);
        try {
            // 1. Sign Up
            const { data: { session, user }, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) throw signUpError;
            if (!user) throw new Error("Sign up failed - no user created");

            // 2. Upload Image
            const ext = image.substring(image.lastIndexOf('.') + 1);
            const fileName = `${user.id}.${ext}`;
            const formData = new FormData();

            formData.append('files', {
                uri: image,
                name: fileName,
                type: `image/${ext}`
            });

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, formData, {
                    contentType: `image/${ext}`,
                    upsert: true
                });

            if (uploadError) {
                console.error("Storage upload error:", uploadError);
            }

            const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
            const avatarUrl = publicUrlData.publicUrl;

            // 3. Create Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: user.id,
                        full_name: name,
                        email: email,
                        dob: dob,
                        age: parseInt(age),
                        avatar_url: avatarUrl,
                    }
                ]);

            if (profileError) throw profileError;

            Alert.alert("Success", "Account created successfully!", [
                { text: "OK", onPress: () => navigation.replace('Login') }
            ]);

        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={[Colors.gradientStart, Colors.background]} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.header}>Create Account</Text>

                    <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <Ionicons name="camera" size={40} color={Colors.textSecondary} />
                                <Text style={styles.imageText}>Profile Photo (Required)</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TextInput
                        placeholder="Full Name"
                        placeholderTextColor={Colors.textSecondary}
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                    />
                    <TextInput
                        placeholder="Email"
                        placeholderTextColor={Colors.textSecondary}
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <View style={styles.row}>
                        <TextInput
                            placeholder="DOB (YYYY-MM-DD)"
                            placeholderTextColor={Colors.textSecondary}
                            style={[styles.input, { flex: 2, marginRight: 10 }]}
                            value={dob}
                            onChangeText={setDob}
                        />
                        <TextInput
                            placeholder="Age"
                            placeholderTextColor={Colors.textSecondary}
                            style={[styles.input, { flex: 1 }]}
                            keyboardType="numeric"
                            value={age}
                            onChangeText={setAge}
                        />
                    </View>
                    <TextInput
                        placeholder="Password"
                        placeholderTextColor={Colors.textSecondary}
                        style={styles.input}
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TextInput
                        placeholder="Confirm Password"
                        placeholderTextColor={Colors.textSecondary}
                        style={styles.input}
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
                        {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Sign Up</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.linkText}>Already have an account? Log In</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    scrollContent: { padding: 20, alignItems: 'center' },
    header: { fontSize: 32, fontWeight: 'bold', color: Colors.text, marginBottom: 30 },
    imagePicker: { marginBottom: 30 },
    profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: Colors.primary },
    placeholderImage: {
        width: 120, height: 120, borderRadius: 60,
        backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: Colors.textSecondary, borderStyle: 'dashed'
    },
    imageText: { color: Colors.textSecondary, fontSize: 10, marginTop: 5, textAlign: 'center' },
    input: {
        width: '100%', backgroundColor: Colors.card, color: Colors.text,
        padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16
    },
    row: { flexDirection: 'row', width: '100%' },
    button: {
        width: '100%', backgroundColor: Colors.primary, padding: 15, borderRadius: 30,
        alignItems: 'center', marginTop: 10, marginBottom: 20
    },
    buttonText: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },
    linkText: { color: Colors.textSecondary, fontSize: 14 },
});
