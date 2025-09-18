import { NextResponse } from "next/server";
import axios from "axios";
import querystring from "querystring";

const client_id = "f0a194a6e44b425fbdf257fb380beb48";
const client_secret = "b38adf69f029496c8e74df682a1b576a";
const redirect_uri = "http://127.0.0.1:3000/api/auth/callback/spotify";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    // Tausche den Code gegen Access Token
    const tokenRes = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri,
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(client_id + ":" + client_secret).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = tokenRes.data;

    // --- Top-Tracks ---
    const topTracksRes = await axios.get(
      "https://api.spotify.com/v1/me/top/tracks?limit=1&time_range=short_term",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const topTracks = topTracksRes.data.items.map((track: any) => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map((a: any) => a.name).join(", "),
      album: track.album.name,
      preview_url: track.preview_url,
      image: track.album.images?.[0]?.url || null,
    }));

    const topTracksMinimal = topTracks.map(
      (track: { name: string; artist: string; image: string }) => ({
        name: track.name,
        artist: track.artist,
        image: track.image,
      })
    );

    // --- Top-Artists ---
    const topArtistsRes = await axios.get(
      "https://api.spotify.com/v1/me/top/artists?limit=1&time_range=medium_term",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const topArtist = topArtistsRes.data.items[0]
      ? {
          id: topArtistsRes.data.items[0].id,
          name: topArtistsRes.data.items[0].name,
          image: topArtistsRes.data.items[0].images?.[0]?.url || null,
          genres: topArtistsRes.data.items[0].genres,
        }
      : null;

    // Query-String vorbereiten
    const queryString = encodeURIComponent(
      JSON.stringify({ topTracks: topTracksMinimal, topArtist })
    );

    return NextResponse.redirect(
      new URL(`/profile_edit?data=${queryString}`, req.url)
    );
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    return NextResponse.json({ error: "Spotify auth failed" }, { status: 500 });
  }
}