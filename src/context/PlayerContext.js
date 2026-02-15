import React, { createContext, useState, useContext, useRef, useCallback, useEffect } from 'react';
import YoutubePlayer from 'react-native-youtube-iframe';
import { View, StyleSheet } from 'react-native';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
    const playerRef = useRef(null);
    const resumePositionRef = useRef(0); // Track position for resume after pause

    const [currentSong, setCurrentSong] = useState(null);
    const [playlist, setPlaylist] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [loading, setLoading] = useState(false);

    const playSong = useCallback((song, queue = null, index = 0) => {
        setCurrentSong(song);
        if (queue) {
            setPlaylist(queue);
            setCurrentIndex(index);
        } else {
            setPlaylist([song]);
            setCurrentIndex(0);
        }
        setPlaying(true);
        setCurrentTime(0);
    }, []);

    const playNext = useCallback(() => {
        if (playlist && playlist.length > 0) {
            setCurrentTime(0);
            resumePositionRef.current = 0; // Clear resume position for new song
            setPlaying(true); // Ensure next song plays

            if (currentIndex < playlist.length - 1) {
                const nextIndex = currentIndex + 1;
                setCurrentIndex(nextIndex);
                setCurrentSong(playlist[nextIndex]);
            } else {
                // Loop back to start
                setCurrentIndex(0);
                setCurrentSong(playlist[0]);
            }
        }
    }, [currentIndex, playlist]);

    const playPrevious = useCallback(() => {
        if (playlist && playlist.length > 0) {
            setCurrentTime(0);
            resumePositionRef.current = 0; // Clear resume position for new song
            setPlaying(true); // Ensure previous song plays

            if (currentIndex > 0) {
                const prevIndex = currentIndex - 1;
                setCurrentIndex(prevIndex);
                setCurrentSong(playlist[prevIndex]);
            } else {
                // Loop to end
                const lastIndex = playlist.length - 1;
                setCurrentIndex(lastIndex);
                setCurrentSong(playlist[lastIndex]);
            }
        }
    }, [currentIndex, playlist]);

    const seekTo = useCallback((seconds) => {
        if (playerRef.current) {
            playerRef.current.seekTo(seconds, true);
            setCurrentTime(seconds);
        }
    }, []);

    const onStateChange = useCallback((state) => {
        if (state === 'ended') {
            if (playlist) {
                playNext();
            } else {
                setPlaying(false);
                setCurrentTime(0);
            }
        } else if (state === 'playing') {
            setLoading(false);
            setPlaying(true);
        } else if (state === 'paused') {
            setPlaying(false);
        } else if (state === 'buffering') {
            setLoading(true);
        }
    }, [playlist, playNext]);

    const onReady = useCallback(async () => {
        setLoading(false);
        if (playerRef.current) {
            try {
                // If we have a saved resume position, seek to it
                if (resumePositionRef.current > 0) {
                    console.log('Resuming to position:', resumePositionRef.current);
                    await playerRef.current.seekTo(resumePositionRef.current, true);
                    resumePositionRef.current = 0; // Clear after use
                } else {
                    // For new songs, seek to 0 to kickstart playback
                    console.log('Starting new song from beginning');
                    await playerRef.current.seekTo(0, true);
                }

                const d = await playerRef.current.getDuration();
                if (d) setDuration(d);
            } catch (e) {
                console.log("Global Player Ready Error:", e);
            }
        }
    }, []);

    // When pausing, save the position for resume
    const togglePlay = useCallback(() => {
        if (playing) {
            // Pausing - save current position
            resumePositionRef.current = currentTime;
            console.log('Pausing at:', currentTime);
        }
        setPlaying(prev => !prev);
    }, [playing, currentTime]);

    // Polling for time
    useEffect(() => {
        let interval;
        if (playing && currentSong) {
            interval = setInterval(async () => {
                if (playerRef.current) {
                    try {
                        const time = await playerRef.current.getCurrentTime();
                        const dur = await playerRef.current.getDuration();
                        if (time !== undefined) setCurrentTime(time);
                        if (dur) setDuration(dur);
                    } catch (e) { }
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [playing, currentSong]);

    const videoId = currentSong?.videoId || currentSong?.video_id || currentSong?.id;

    return (
        <PlayerContext.Provider
            value={{
                currentSong,
                playing,
                currentTime,
                duration,
                loading,
                playlist,
                currentIndex,
                playSong,
                togglePlay,
                playNext,
                playPrevious,
                seekTo,
                setPlaying,
            }}
        >
            {children}
            {/* Global Hidden Player - Only render when playing */}
            {currentSong && playing && (
                <View style={styles.hiddenContainer}>
                    <YoutubePlayer
                        key={videoId}
                        ref={playerRef}
                        height={100}
                        width={100}
                        play={true}
                        videoId={videoId}
                        onChangeState={onStateChange}
                        onReady={onReady}
                        webViewProps={{
                            allowsInlineMediaPlayback: true,
                            mediaPlaybackRequiresUserAction: false,
                            androidLayerType: 'hardware',
                            opacity: 0.01,
                            allowsBackgroundMediaPlayback: true,
                        }}
                        initialPlayerParams={{
                            preventFullScreen: true,
                            modestbranding: true,
                            controls: false,
                            rel: 0,
                            start: Math.floor(currentTime),
                        }}
                    />
                </View>
            )}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => useContext(PlayerContext);

const styles = StyleSheet.create({
    hiddenContainer: {
        position: 'absolute',
        top: -1000, // Way off screen
        left: -1000,
        width: 100,
        height: 100,
        opacity: 0.01,
    }
});
