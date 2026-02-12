import React, { createContext, useState, useContext, useRef, useCallback, useEffect } from 'react';
import YoutubePlayer from 'react-native-youtube-iframe';
import { View, StyleSheet } from 'react-native';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
    const playerRef = useRef(null);
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
            if (currentIndex < playlist.length - 1) {
                const nextIndex = currentIndex + 1;
                setCurrentIndex(nextIndex);
                setCurrentSong(playlist[nextIndex]);
            } else {
                setCurrentIndex(0);
                setCurrentSong(playlist[0]);
            }
        }
    }, [currentIndex, playlist]);

    const playPrevious = useCallback(() => {
        if (playlist && playlist.length > 0) {
            setCurrentTime(0);
            if (currentIndex > 0) {
                const prevIndex = currentIndex - 1;
                setCurrentIndex(prevIndex);
                setCurrentSong(playlist[prevIndex]);
            } else {
                const lastIndex = playlist.length - 1;
                setCurrentIndex(lastIndex);
                setCurrentSong(playlist[lastIndex]);
            }
        }
    }, [currentIndex, playlist]);

    const togglePlay = useCallback(() => {
        setPlaying(prev => !prev);
    }, []);

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
                // Force kickstart if time is near 0
                if (currentTime < 1) {
                    playerRef.current.seekTo(0, true);
                }
                const d = await playerRef.current.getDuration();
                if (d) setDuration(d);
            } catch (e) {
                console.log("Global Player Ready Error:", e);
            }
        }
    }, [currentTime]);

    // Force commands via Ref when state changes
    useEffect(() => {
        if (playerRef.current) {
            if (playing) {
                playerRef.current.playVideo?.();
            } else {
                playerRef.current.pauseVideo?.();
            }
        }
    }, [playing]);

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
            {/* Global Hidden Player */}
            {currentSong && (
                <View style={styles.hiddenContainer}>
                    <YoutubePlayer
                        key={videoId}
                        ref={playerRef}
                        height={100}
                        width={100}
                        play={playing}
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
