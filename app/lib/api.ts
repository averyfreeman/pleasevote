import type { ElectionsResponse, VoterInfoResponse } from "./types";

const GOOGLE_CIVIC_API_KEY = process.env.GOOGLE_CIVIC_API_KEY;
const BASE_URL = "https://www.googleapis.com/civicinfo/v2";

export async function fetchElections(): Promise<ElectionsResponse> {
  const url = `${BASE_URL}/elections?key=${GOOGLE_CIVIC_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch elections: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchVoterInfo(
  address: string,
  electionId?: number
): Promise<VoterInfoResponse> {
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
  return response.json();
}

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
