import { useState } from "react";
import { Compass, LoaderCircle, MapPin } from "lucide-react";
import { fetchDiscovery } from "~/lib/api";
import { classifyLocations, DEFAULT_RADIUS_MILES, normalizeRadius } from "~/lib/domain";
import type { DiscoveryResponse, VotingLocation } from "~/lib/types";
import { directionsUrl, formatAddress } from "./LocationSection";

/** Evaluate a separate place without implying that the visitor is eligible there. */
export default function DiscoveryPanel({ electionId, radiusMiles = DEFAULT_RADIUS_MILES }: { readonly electionId: string; readonly radiusMiles?: number }) {
  const selectedRadius = normalizeRadius(radiusMiles);
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<DiscoveryResponse>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) {
      setError("Enter another place to explore.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      setResult(await fetchDiscovery(trimmed, electionId));
    } catch (cause) {
      setResult(undefined);
      setError(cause instanceof Error ? cause.message : "The alternate-place lookup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="no-print rounded-2xl border border-secondary/30 bg-secondary/10 p-5" aria-labelledby="discovery-heading" aria-busy={loading}>
      <div className="flex items-start gap-3">
        <Compass aria-hidden="true" className="mt-1 shrink-0 text-secondary" />
        <div>
      <h2 id="discovery-heading" className="text-xl font-black">Checking a different location?</h2>
      <p className="mt-1 text-sm leading-6 text-base-content/70">Look up a work address, travel stop, or second home. This does not establish that you can vote there.</p>
        </div>
      </div>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={submit} aria-describedby="discovery-help discovery-status">
        <label className="sr-only" htmlFor="discovery-address">Another place</label>
        <input id="discovery-address" className="input input-bordered flex-1 bg-base-100" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Another address or place" autoComplete="street-address" required />
        <button className="btn btn-secondary" type="submit" disabled={loading} aria-busy={loading}>{loading ? <><LoaderCircle aria-hidden="true" className="animate-spin" size={18} /><span>Checking…</span></> : <><Compass aria-hidden="true" size={18} /><span>Check this place</span></>}</button>
      </form>
      <p id="discovery-help" className="sr-only">This lookup is for discovery only and does not establish eligibility.</p>
      <p id="discovery-status" className="mt-2 min-h-5 text-sm font-semibold text-error" aria-live="polite">{error}</p>
      {result ? <DiscoveryResult result={result} radiusMiles={selectedRadius} /> : null}
    </section>
  );
}

function DiscoveryResult({ result, radiusMiles }: { readonly result: DiscoveryResponse; readonly radiusMiles: number }) {
  const groups = [
    classifyLocations(result.pollingLocations, result.origin, radiusMiles),
    classifyLocations(result.earlyVoteSites, result.origin, radiusMiles),
    classifyLocations(result.dropOffLocations, result.origin, radiusMiles),
  ];
  const locations = groups.flatMap((group) => group.inRadius).sort((left, right) => (left.distanceMiles ?? Infinity) - (right.distanceMiles ?? Infinity));
  const missingCoordinates = groups.flatMap((group) => group.missingCoordinates);
  const outsideRadius = groups.reduce((total, group) => total + group.outsideRadius.length, 0);
  return (
    <div className="mt-4 border-t border-secondary/25 pt-4" aria-live="polite">
      <p className="font-bold">{result.normalizedAddress.formatted || result.address}</p>
      <p className="mt-2 rounded-xl bg-warning/15 p-3 text-sm leading-6">{result.warning}</p>
      {result.mode === "test-fixture" ? <p className="mt-2 rounded-xl bg-warning/15 p-3 text-sm font-bold leading-6">Sample fixture data — not a current election and not matched to this place. Confirm current details with the official election administrator.</p> : null}
      <p className="mt-3 text-sm text-base-content/70">Jurisdiction comparison: <strong>{result.jurisdictionComparison.replaceAll("-", " ")}</strong>. Election: {result.election.name}.</p>
      <p className="mt-3 text-sm text-base-content/70">Showing places within {radiusMiles} miles of this place. This is a distance convenience, not an eligibility decision.</p>
      {locations.length ? <div className="mt-3 grid gap-3 sm:grid-cols-2">{locations.slice(0, 10).map((location) => <DiscoveryLocation key={location.id} location={location} />)}</div> : <p className="mt-3 text-sm text-base-content/70">No voting locations with coordinates were returned within this distance.</p>}
      {outsideRadius ? <p className="mt-3 text-xs text-base-content/60">{outsideRadius} more place(s) are outside the selected distance.</p> : null}
      {missingCoordinates.length ? <div className="mt-3 rounded-xl border border-warning/35 bg-warning/10 p-3" aria-label="Discovery locations without coordinates"><h3 className="font-bold">{missingCoordinates.length} place(s) without coordinates</h3><p className="mt-2 text-sm leading-6 text-base-content/70">These records are retained for review. Confirm the address and hours with the official election administrator.</p><div className="mt-3 grid gap-3">{missingCoordinates.map((location) => <DiscoveryLocation key={location.id} location={location} />)}</div></div> : null}
    </div>
  );
}

function DiscoveryLocation({ location }: { readonly location: VotingLocation }) {
  const url = directionsUrl(location);
  return <article className="rounded-xl border border-base-300 bg-base-100 p-4"><div className="flex items-start justify-between gap-3"><h3 className="font-extrabold">{location.address.locationName || "Voting-related location"}</h3><span className="badge badge-secondary badge-outline whitespace-nowrap">{location.distanceMiles === undefined ? "Distance unavailable" : `${location.distanceMiles.toFixed(1)} mi`}</span></div><p className="mt-2 flex gap-2 text-sm text-base-content/75"><MapPin aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-secondary" />{formatAddress(location.address)}</p>{location.pollingHours ? <p className="mt-2 whitespace-pre-line text-sm">{location.pollingHours}</p> : null}{location.voterServices ? <p className="mt-2 text-sm font-semibold">Services: {location.voterServices}</p> : null}{url ? <a className="link link-secondary mt-3 inline-block text-sm font-bold" href={url} target="_blank" rel="noreferrer">Directions<span className="sr-only"> (opens in a new tab)</span></a> : null}</article>;
}
