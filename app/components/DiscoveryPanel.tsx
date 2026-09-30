import { useState } from "react";
import { Compass, LoaderCircle, MapPin } from "lucide-react";
import { fetchDiscovery } from "~/lib/api";
import type { DiscoveryResponse, VotingLocation } from "~/lib/types";
import { directionsUrl, formatAddress } from "./LocationSection";

/** Evaluate a separate place without implying that the visitor is eligible there. */
export default function DiscoveryPanel({ electionId }: { readonly electionId: string }) {
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
    <section className="no-print rounded-2xl border border-secondary/30 bg-secondary/10 p-5" aria-labelledby="discovery-heading">
      <div className="flex items-start gap-3">
        <Compass aria-hidden="true" className="mt-1 shrink-0 text-secondary" />
        <div>
          <h2 id="discovery-heading" className="text-xl font-black">Looking for voting information somewhere else?</h2>
          <p className="mt-1 text-sm leading-6 text-base-content/70">Run a separate place lookup for work, travel, or another home. This does not establish that you are eligible to vote there.</p>
        </div>
      </div>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={submit}>
        <label className="sr-only" htmlFor="discovery-address">Another place</label>
        <input id="discovery-address" className="input input-bordered flex-1 bg-base-100" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Another address or place" />
        <button className="btn btn-secondary" type="submit" disabled={loading}>{loading ? <LoaderCircle aria-hidden="true" className="animate-spin" size={18} /> : <Compass aria-hidden="true" size={18} />}Explore this place</button>
      </form>
      <p className="mt-2 min-h-5 text-sm font-semibold text-error" aria-live="polite">{error}</p>
      {result ? <DiscoveryResult result={result} /> : null}
    </section>
  );
}

function DiscoveryResult({ result }: { readonly result: DiscoveryResponse }) {
  const locations = [...result.pollingLocations, ...result.earlyVoteSites, ...result.dropOffLocations];
  return (
    <div className="mt-4 border-t border-secondary/25 pt-4" aria-live="polite">
      <p className="font-bold">{result.normalizedAddress.formatted || result.address}</p>
      <p className="mt-2 rounded-xl bg-warning/15 p-3 text-sm leading-6">{result.warning}</p>
      <p className="mt-3 text-sm text-base-content/70">Jurisdiction comparison: <strong>{result.jurisdictionComparison.replaceAll("-", " ")}</strong>. Election: {result.election.name}.</p>
      {locations.length ? <div className="mt-3 grid gap-3 sm:grid-cols-2">{locations.slice(0, 10).map((location) => <DiscoveryLocation key={location.id} location={location} />)}</div> : <p className="mt-3 text-sm text-base-content/70">No voting-related locations were returned for this place.</p>}
    </div>
  );
}

function DiscoveryLocation({ location }: { readonly location: VotingLocation }) {
  const url = directionsUrl(location);
  return <article className="rounded-xl border border-base-300 bg-base-100 p-4"><h3 className="font-extrabold">{location.address.locationName || "Voting-related location"}</h3><p className="mt-2 flex gap-2 text-sm text-base-content/75"><MapPin aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-secondary" />{formatAddress(location.address)}</p>{location.pollingHours ? <p className="mt-2 whitespace-pre-line text-sm">{location.pollingHours}</p> : null}{url ? <a className="link link-secondary mt-3 inline-block text-sm font-bold" href={url} target="_blank" rel="noreferrer">Directions<span className="sr-only"> (opens in a new tab)</span></a> : null}</article>;
}
