import type { ElectionsResponse, VoterInfoResponse } from "./types";

/**
 * The Google Civic Information API Key.
 * Fetched from VITE environment variables for security.
 */
const GOOGLE_CIVIC_API_KEY = import.meta.env.VITE_GOOGLE_CIVIC_API_KEY;
const BASE_URL = "https://www.googleapis.com/civicinfo/v2";

/**
 * Fetches the list of all available elections.
 * Implements session caching to minimize API calls.
 */
export async function fetchElections(): Promise<ElectionsResponse> {
  if (typeof window !== "undefined") {
    const cached = window.sessionStorage.getItem("elections_list");
    if (cached) return JSON.parse(cached);
  }

  const url = `${BASE_URL}/elections?key=${GOOGLE_CIVIC_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch elections: ${response.statusText}`);
  }
  const data = await response.json();

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem("elections_list", JSON.stringify(data));
  }

  return data;
}

/**
 * Fetches voter information for a specific address and election.
 * Implements session caching keyed by address and election ID.
 */
export async function fetchVoterInfo(
  address: string,
  electionId?: number
): Promise<VoterInfoResponse> {
  const cacheKey = `voterinfo_${address}_${electionId || "default"}`;

  if (typeof window !== "undefined") {
    const cached = window.sessionStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  let url = `${BASE_URL}/voterinfo?key=${GOOGLE_CIVIC_API_KEY}&address=${encodeURIComponent(
    address
  )}`;
  if (electionId) {
    url += `&electionId=${electionId}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.error?.message || `Failed to fetch voter info: ${response.statusText}`
    );
  }
  const data = await response.json();

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(cacheKey, JSON.stringify(data));
  }

  return data;
}

/**
 * Calculates the Haversine distance between two sets of coordinates in miles.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Radius of Earth in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
