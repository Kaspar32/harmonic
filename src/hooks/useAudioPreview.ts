"use client";

import { useRef, useCallback, useEffect } from "react";

export function useAudioPreview() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const playTrack = useCallback((previewUrl: string | null | undefined) => {
    if (!previewUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio(previewUrl);
    audioRef.current.play().catch((err) => {
      console.error("Audio playback failed:", err);
    });
  }, []);

  const pauseTrack = useCallback(() => {
    audioRef.current?.pause();
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
    []
  );

  const playDeezerTrack = useCallback(
    async (trackName: string | null, artistName: string | null) => {
      const preview = await fetchDeezerPreview(trackName, artistName);
      if (preview) playTrack(preview);
      return preview;
    },
    [fetchDeezerPreview, playTrack]
  );

  return { playTrack, pauseTrack, fetchDeezerPreview, playDeezerTrack };
}