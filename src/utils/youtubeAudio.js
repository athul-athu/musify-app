/**
 * YouTube Audio Extractor Utility
 * Uses a free API service to extract audio streams from YouTube videos
 */

// Using a free YouTube audio extraction service
// Alternative services: youtube-mp3-api, ytdl-core (requires backend)
const AUDIO_EXTRACTION_API = 'https://yt-api.p.rapidapi.com/dl';

/**
 * Get audio stream URL from YouTube video ID
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<string>} - Direct audio stream URL
 */
export async function getYouTubeAudioUrl(videoId) {
    try {
        // Method 1: Using a public YouTube audio extraction service
        // Note: This is a simplified approach. For production, you should use your own backend

        // For now, we'll use a workaround with YouTube embed URLs
        // This won't provide direct audio, but we can use expo-av to play YouTube videos

        // Alternative: Use a third-party service like invidious
        const invidiousInstances = [
            'https://invidious.snopyta.org',
            'https://yewtu.be',
            'https://invidious.kavin.rocks',
        ];

        for (const instance of invidiousInstances) {
            try {
                const response = await fetch(`${instance}/api/v1/videos/${videoId}`, {
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();

                    // Get the best audio format
                    const audioFormats = data.adaptiveFormats?.filter(
                        format => format.type?.includes('audio')
                    ) || [];

                    if (audioFormats.length > 0) {
                        // Sort by bitrate and get the best quality
                        audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
                        return audioFormats[0].url;
                    }
                }
            } catch (error) {
                console.log(`Failed to fetch from ${instance}, trying next...`);
                continue;
            }
        }

        // Fallback: Return null if no audio URL found
        console.warn('Could not extract audio URL, will use YouTube embed');
        return null;

    } catch (error) {
        console.error('Error extracting YouTube audio:', error);
        return null;
    }
}

/**
 * Get video info including audio URL
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} - Video info with audio URL
 */
export async function getVideoInfo(videoId) {
    try {
        const audioUrl = await getYouTubeAudioUrl(videoId);
        return {
            videoId,
            audioUrl,
            hasAudio: !!audioUrl,
        };
    } catch (error) {
        console.error('Error getting video info:', error);
        return {
            videoId,
            audioUrl: null,
            hasAudio: false,
        };
    }
}
