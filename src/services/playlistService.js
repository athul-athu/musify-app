import { supabase } from '../lib/supabase';

// Create a new playlist
export const createPlaylist = async (userId, name) => {
    try {
        const { data, error } = await supabase
            .from('playlists')
            .insert([{ user_id: userId, name: name }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating playlist:', error);
        throw error;
    }
};

// Get all playlists for a user
export const getUserPlaylists = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('playlists')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching playlists:', error);
        throw error;
    }
};

// Add a song to a playlist
export const addSongToPlaylist = async (playlistId, songData) => {
    try {
        const { data, error } = await supabase
            .from('playlist_songs')
            .insert([{
                playlist_id: playlistId,
                video_id: songData.videoId || songData.id,
                title: songData.title,
                artist: songData.artist,
                thumbnail: songData.artwork || songData.thumbnail
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding song to playlist:', error);
        throw error;
    }
};

// Get songs in a playlist
export const getPlaylistSongs = async (playlistId) => {
    try {
        const { data, error } = await supabase
            .from('playlist_songs')
            .select('*')
            .eq('playlist_id', playlistId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching playlist songs:', error);
        throw error;
    }
};

// Delete a playlist
export const deletePlaylist = async (playlistId) => {
    try {
        const { error } = await supabase
            .from('playlists')
            .delete()
            .eq('id', playlistId);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting playlist:', error);
        throw error;
    }
};

// Remove a song from a playlist
export const removeSongFromPlaylist = async (songId) => {
    try {
        const { error } = await supabase
            .from('playlist_songs')
            .delete()
            .eq('id', songId);

        if (error) throw error;
    } catch (error) {
        console.error('Error removing song from playlist:', error);
        throw error;
    }
};
