// Spotify source.
//
// Uses Client Credentials flow (no user auth) — gets us app-level access to
// public artist data. Returns the artist's follower count.
//
// API exposes:
//   - followers.total — spread over 4–5 orders of magnitude, very interpretable
//   - popularity (0–100) — recency-weighted, compresses badly at the top
//
// We use followers.total. Requires:
//   - Each music Item to carry a `spotifyId` (run scripts/assign-spotify-ids.mjs)
//   - SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET env vars
//
// Returns null if creds are missing or the item has no spotifyId. The blender
// drops null signals from the round, so the game stays playable without Spotify.

import type { Item } from "../types";
import type { SourceFetcher } from "./types";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;

  // Token TTL is 1h; refresh ~5 min early.
  if (cachedToken && cachedToken.expiresAt - 5 * 60 * 1000 > Date.now()) {
    return cachedToken.value;
  }

  const body = new URLSearchParams({ grant_type: "client_credentials" });
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    console.error(`Spotify token fetch failed: ${res.status}`);
    return null;
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.value;
}

export const spotifySource: SourceFetcher = async (item: Item) => {
  if (!item.spotifyId) return null;

  const token = await getAccessToken();
  if (!token) return null;

  const res = await fetch(`${API_BASE}/artists/${item.spotifyId}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 60 * 60 * 24 }, // 24h
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    console.error(`Spotify artist fetch ${res.status} for ${item.spotifyId}`);
    return null;
  }

  const data = (await res.json()) as { followers?: { total?: number } };
  return data.followers?.total ?? 0;
};
