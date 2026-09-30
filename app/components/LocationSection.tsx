import { useId, useState } from "react";
import { ExternalLink, MapPin, Navigation } from "lucide-react";
import type { LocationResults } from "~/lib/domain";
import type { VotingLocation } from "~/lib/types";

interface LocationSectionProps {
  /** Section title. */
  readonly title: string;
  /** Plain-language explanation of the location category. */
  readonly description: string;
  /** Filtered records for the category. */
  readonly results: LocationResults;
  /** Empty state for the category. */
  readonly emptyMessage: string;
}

/** Join address lines without manufacturing an address when the provider omitted it. */
export function formatAddress(address: VotingLocation["address"]): string {
  return [
    address.locationName,
    address.line1,
    address.line2,
    address.line3,
    [address.city, address.state, address.zip].filter(Boolean).join(", ").replace(", ,", ","),
  ].filter(Boolean).join(" · ");
}

/** Make an external directions link from the provider address or coordinates. */
export function directionsUrl(location: VotingLocation): string | undefined {
  const destination = location.point
    ? `${location.point.latitude},${location.point.longitude}`
    : formatAddress(location.address);
  return destination ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}` : undefined;
}

function LocationCard({ location }: { readonly location: VotingLocation }) {
  const headingId = useId();
  const url = directionsUrl(location);
  const official = location.sources.some((source) => source.official);
  const address = formatAddress(location.address);

  return (
    <article className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm" aria-labelledby={headingId}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id={headingId} className="text-lg font-extrabold">{location.address.locationName || "Voting-related location"}</h3>
          {official ? <span className="badge badge-success badge-outline mt-2">Official source</span> : <span className="badge badge-warning badge-outline mt-2">Confirm this place</span>}
        </div>
        {location.distanceMiles !== undefined ? (
          <span className="badge badge-primary badge-outline whitespace-nowrap">{location.distanceMiles.toFixed(1)} mi away</span>
        ) : (
          <span className="badge badge-ghost whitespace-nowrap">Distance unavailable</span>
        )}
      </div>
      {address ? <p className="mt-4 flex items-start gap-2 text-base-content/80"><MapPin aria-hidden="true" className="mt-0.5 shrink-0 text-primary" size={18} /><span>{address}</span></p> : null}
      {location.pollingHours ? (
        <div className="mt-4 rounded-xl bg-base-200 p-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-base-content/60">Hours</h4>
          <p className="mt-1 whitespace-pre-line text-sm font-semibold leading-6">{location.pollingHours}</p>
        </div>
      ) : <p className="mt-4 text-sm italic text-base-content/60">Hours were not provided.</p>}
      {location.notes ? <p className="mt-3 text-sm leading-6 text-base-content/70">{location.notes}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {url ? <a className="btn btn-primary btn-sm" href={url} target="_blank" rel="noreferrer"><Navigation aria-hidden="true" size={16} />Directions<span className="sr-only"> (opens in a new tab)</span></a> : null}
        {location.address.line1 ? <a className="btn btn-ghost btn-sm" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address.line1)}`} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" size={15} />View place<span className="sr-only"> (opens in a new tab)</span></a> : null}
      </div>
      <p className="mt-3 text-xs text-base-content/55">This place may offer the service listed above. It does not confirm personal eligibility or an assigned location.</p>
    </article>
  );
}

/** Render a radius-filtered location group with transparent unknown-coordinate handling. */
export default function LocationSection({ title, description, results, emptyMessage }: LocationSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? results.inRadius : results.inRadius.slice(0, 10);

  return (
    <section className="scroll-mt-6" aria-labelledby={`${title}-heading`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id={`${title}-heading`} className="text-2xl font-black tracking-tight">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-base-content/65">{description}</p>
        </div>
        <span className="badge badge-primary badge-lg">{results.inRadius.length} nearby</span>
      </div>
      {visible.length ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {visible.map((location) => <LocationCard key={location.id} location={location} />)}
        </div>
      ) : <div className="mt-4 rounded-2xl border border-dashed border-base-300 bg-base-100 p-6 text-sm text-base-content/70">{emptyMessage}</div>}
      {results.inRadius.length > 10 ? (
        <button className="btn btn-outline btn-sm mt-4" type="button" onClick={() => setShowAll((current) => !current)}>
          {showAll ? "Show nearest 10" : `Show all ${results.inRadius.length} locations`}
        </button>
      ) : null}
      {results.missingCoordinates.length ? (
        <details className="mt-4 rounded-2xl border border-warning/35 bg-warning/10 p-4">
          <summary className="cursor-pointer font-bold">{results.missingCoordinates.length} place(s) without coordinates</summary>
          <p className="mt-2 text-sm leading-6 text-base-content/70">These places are kept here instead of hidden. Check the address and hours with the election office before relying on them.</p>
          <div className="mt-3 grid gap-3">
            {results.missingCoordinates.map((location) => <LocationCard key={location.id} location={location} />)}
          </div>
        </details>
      ) : null}
      {results.outsideRadius.length ? (
        <p className="mt-3 text-xs text-base-content/55">{results.outsideRadius.length} more place(s) are outside the selected distance.</p>
      ) : null}
    </section>
  );
}
