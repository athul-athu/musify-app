import { supabase } from '../lib/supabase';

/**
 * Save the top results from a search query
 * @param {string} userId - Current user ID
 * @param {string} query - The search query string
 * @param {Array} songs - Array of song objects from search results
 */
export const saveRecentSearches = async (userId, query, songs) => {
    if (!userId || !songs || songs.length === 0) return;

    // Take top 3 songs
    const topSongs = songs.slice(0, 3);

    const inserts = topSongs.map(song => ({
        user_id: userId,
        query: query,
        video_id: song.videoId || song.id,
        title: song.title,
        artist: song.artist,
        thumbnail: song.artwork || song.thumbnail
    }));

    try {
        const { error } = await supabase
            .from('recent_searches')
            .insert(inserts);

        if (error) throw error;
    } catch (error) {
        console.error('Error saving recent searches:', error);
    }
};

/**
 * Get the latest 20 unique songs from search history
 * @param {string} userId - Current user ID
 * @returns {Promise<Array>} - Array of song objects
 */
export const getRecentSearches = async (userId) => {
    if (!userId) return [];

    try {
        // We want the latest 20 songs, likely unique by video_id
        // Since Supabase doesn't support easy DISTINCT ON in basic JS client, 
        // we'll fetch more and filter in JS
        const { data, error } = await supabase
            .from('recent_searches')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        // Filter for unique video_ids and keep the first 20
        const seen = new Set();
        const uniqueSongs = [];

        for (const item of data) {
            if (!seen.has(item.video_id)) {
                seen.add(item.video_id);
                uniqueSongs.push({
                    id: item.video_id,
                    videoId: item.video_id,
                    title: item.title,
                    artist: item.artist,
                    artwork: item.thumbnail,
                    thumbnail: item.thumbnail,
                    created_at: item.created_at
                });
            }
            if (uniqueSongs.length >= 20) break;
        }

        return uniqueSongs;
    } catch (error) {
        console.error('Error fetching recent searches:', error);
        return [];
    }
};

/**
 * Clear search history for a user
 * @param {string} userId - Current user ID
 */
export const clearRecentSearches = async (userId) => {
    if (!userId) return;

    try {
        const { error } = await supabase
            .from('recent_searches')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
    } catch (error) {
        console.error('Error clearing recent searches:', error);
        throw error;
    }
};
