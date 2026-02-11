import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchUserProfile(session.user.id);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                fetchUserProfile(session.user.id);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
            } else if (data) {
                setUserProfile(data);
            }
        } catch (error) {
            console.log("Profile fetch error", error);
        }
    };

    const signIn = async (email, password) => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert('Login Failed', error.message);
            setLoading(false);
            return { error };
        }
        setLoading(false);
        return { error: null };
    };

    const signUp = async (email, password, userDetails, imageUri) => {
        setLoading(true);

        // 1. Sign Up Auth User
        const { data: { session, user }, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (signUpError) {
            Alert.alert('Sign Up Error', signUpError.message);
            setLoading(false);
            return { error: signUpError };
        }

        if (!user) {
            Alert.alert("Sign Up Error", "No user returned");
            setLoading(false);
            return { error: { message: "No user returned" } };
        }

        let avatarUrl = null;

        // 2. Upload Image if provided (Mandatory per requirement, checked in UI)
        if (imageUri) {
            try {
                const ext = imageUri.substring(imageUri.lastIndexOf('.') + 1);
                const fileName = `${user.id}.${ext}`;
                const formData = new FormData();
                formData.append('files', {
                    uri: imageUri,
                    name: fileName,
                    type: `image/${ext}`,
                });

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, formData, {
                        contentType: `image/${ext}`,
                        upsert: true
                    });

                if (uploadError) {
                    console.error("Upload error", uploadError);
                    // Continue, but maybe alert?
                } else {
                    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
                    avatarUrl = publicUrlData.publicUrl;
                }
            } catch (e) {
                console.error("Image upload exception", e);
            }
        }

        // 3. Insert Profile Data
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: user.id,
                    full_name: userDetails.fullName,
                    email: email,
                    dob: userDetails.dob,
                    age: parseInt(userDetails.age),
                    avatar_url: avatarUrl,
                }
            ]);

        if (profileError) {
            console.error("Profile insert error", profileError);
            Alert.alert('Profile Error', 'Account created but profile failed to save.');
            // Don't fail the whole sign up, user exists now.
        }

        setLoading(false);
        return { error: null };
    };

    const signOut = async () => {
        try {
            // Sign out from Supabase
            await supabase.auth.signOut();

            // Clear all cached authentication data
            await AsyncStorage.clear();

            // Reset local state
            setSession(null);
            setUserProfile(null);
        } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
    };

    return (
        <AuthContext.Provider value={{ session, loading, userProfile, signIn, signUp, signOut, refreshProfile: fetchUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
