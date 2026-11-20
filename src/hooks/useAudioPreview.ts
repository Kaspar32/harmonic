"use client";
import { useRef, useCallback, useEffect, useState } from "react";

let activeAudio: HTMLAudioElement | null = null;
let stopActiveAudio: (() => void) | null = null;

export function useAudioPreview() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [loadingTrack, setLoadingTrack] = useState<string | null>(null);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      if (activeAudio === audioRef.current) {
        activeAudio = null;
        stopActiveAudio = null;
      }
      audioRef.current = null;
    }
    setPlayingTrack(null);
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current && activeAudio === audioRef.current) {
        audioRef.current.pause();
        activeAudio = null;
        stopActiveAudio = null;
      }
      audioRef.current = null;
    };
  }, []);

  const playTrack = useCallback(
    (previewUrl: string | null | undefined, trackKey?: string) => {
      if (!previewUrl) return;

      const previousAudio = activeAudio;
      previousAudio?.pause();
      stopActiveAudio?.();

      const audio = new Audio(previewUrl);
      audioRef.current = audio;
      activeAudio = audio;

      const clearPlayback = () => {
        setPlayingTrack(null);
        if (audioRef.current === audio) audioRef.current = null;
        if (activeAudio === audio) {
          activeAudio = null;
          stopActiveAudio = null;
        }
      };
      stopActiveAudio = clearPlayback;

      audio.addEventListener("ended", clearPlayback);
      audio.addEventListener("error", clearPlayback);

      audio
        .play()
        .then(() => {
          if (trackKey) setPlayingTrack(trackKey);
        })
        .catch((err) => {
          console.error("Audio playback failed:", err);
          clearPlayback();
        });
    },
    [],
  );

  const pauseTrack = useCallback(() => {
    const audio = audioRef.current;
    audio?.pause();
    if (audio && activeAudio === audio) {
      activeAudio = null;
      stopActiveAudio = null;
    }
    setPlayingTrack(null);
  }, []);

  const fetchDeezerPreview = useCallback(
    async (trackName: string | null, artistName: string | null): Promise<string | null> => {
      if (!trackName || !artistName) return null;

      try {
        const query = encodeURIComponent(`${trackName} ${artistName}`);
        const res = await fetch(`/api/deezer-search?q=${query}`);

        if (!res.ok) throw new Error("Deezer search failed");

        const data = await res.json();
        return data.data?.[0]?.preview ?? null;
      } catch (err) {
        console.error("Fehler beim Abruf der Deezer‑Preview:", err);
        return null;
      }
    },
    [],
  );

  const playDeezerTrack = useCallback(
    async (trackName: string | null, artistName: string | null, trackKey?: string) => {
      const preview = await fetchDeezerPreview(trackName, artistName);
      if (preview) playTrack(preview, trackKey);
      return preview;
    },
    [fetchDeezerPreview, playTrack],
  );

  const toggleDeezerTrack = useCallback(
    async (trackKey: string, trackName: string | null, artistName: string | null) => {
      if (playingTrack === trackKey) {
        pauseTrack();
        return;
      }

      setLoadingTrack(trackKey);
      try {
        await playDeezerTrack(trackName, artistName, trackKey);
      } finally {
        setLoadingTrack(null);
      }
    },
    [pauseTrack, playDeezerTrack, playingTrack],
  );

  const isTrackPlaying = useCallback(
    (trackKey: string) => playingTrack === trackKey,
    [playingTrack],
  );

  const isTrackLoading = useCallback(
    (trackKey: string) => loadingTrack === trackKey,
    [loadingTrack],
  );

  return {
    playTrack,
    pauseTrack,
    fetchDeezerPreview,
    playDeezerTrack,
    toggleDeezerTrack,
    playingTrack,
    isPlaying: playingTrack !== null,
    isTrackPlaying,
    isTrackLoading,
  };
}