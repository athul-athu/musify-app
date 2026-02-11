import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import { supabase } from '../lib/supabase';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter email and password");
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert("Login Failed", error.message);
            setLoading(false);
        } else {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={[Colors.gradientStart, Colors.background]} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <Text style={styles.header}>Musify</Text>
                    <Text style={styles.subHeader}>Result of music</Text>

                    <TextInput
                        placeholder="Email"
                        placeholderTextColor={Colors.textSecondary}
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TextInput
                        placeholder="Password"
                        placeholderTextColor={Colors.textSecondary}
                        style={styles.input}
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                        {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Log In</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={{ marginTop: 20 }}>
                        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    header: { fontSize: 40, fontWeight: 'bold', color: Colors.primary, marginBottom: 10 },
    subHeader: { fontSize: 18, color: Colors.textSecondary, marginBottom: 40 },
    input: {
        width: '100%', backgroundColor: Colors.card, color: Colors.text,
        padding: 15, borderRadius: 8, marginBottom: 20, fontSize: 16
    },
    button: {
        width: '100%', backgroundColor: Colors.primary, padding: 15, borderRadius: 30,
        alignItems: 'center', marginTop: 10
    },
    buttonText: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },
    linkText: { color: Colors.text, fontSize: 14 },
});
