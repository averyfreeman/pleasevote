import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, CalendarDays, FileDown, Info, ListChecks, MapPinned } from "lucide-react";
import { Link, useLoaderData, useSearchParams } from "react-router";
import type { Route } from "./+types/voterinfo";

import AdministrationSection from "~/components/AdministrationSection";
import ContestSection from "~/components/ContestSection";
import DiscoveryPanel from "~/components/DiscoveryPanel";
import LocationSection from "~/components/LocationSection";
import { fetchVoterInfo } from "~/lib/api";
import { buildVotingPlan, DEFAULT_RADIUS_MILES, normalizeRadius } from "~/lib/domain";

/** Load one normalized voter-information plan from the Go API. */
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const address = url.searchParams.get("address")?.trim();
  const electionId = url.searchParams.get("electionId")?.trim() || undefined;

  if (!address) {
    return { error: "Enter an address before requesting voter information." } as const;
  }

  try {
    const data = await fetchVoterInfo(address, electionId, request.signal);
    return { data, address } as const;
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Unable to load voter information.";
    return { error: message, address } as const;
  }
}

function displayAddress(address: { readonly line1?: string; readonly city?: string; readonly state?: string; readonly zip?: string; readonly formatted?: string }): string {
  return address.formatted || [address.line1, address.city, address.state, address.zip].filter(Boolean).join(", ");
}

/** Render an accessible, print-friendly voting information plan. */
export default function VoterInfo() {
  const loaderData = useLoaderData<typeof clientLoader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const data = "data" in loaderData ? loaderData.data : undefined;
  const address = "address" in loaderData ? loaderData.address : undefined;
  const radius = normalizeRadius(searchParams.get("radius") || DEFAULT_RADIUS_MILES);
  const [radiusDraft, setRadiusDraft] = useState(radius);

  useEffect(() => setRadiusDraft(radius), [radius]);

  if (!data) {
    return (
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="alert alert-error items-start"><AlertTriangle aria-hidden="true" className="mt-0.5" /><div><h1 className="font-black">We could not load voter information</h1><p className="mt-1">{loaderData.error}</p></div></div>
        <Link to="/" className="btn btn-primary mt-6"><ArrowLeft aria-hidden="true" size={18} />Return to address search</Link>
      </main>
    );
  }

  const plan = buildVotingPlan(data, radius);
  const normalized = displayAddress(data.normalizedAddress) || address || data.address;
  const fallback = data.mode === "test-fallback";

  function applyRadius(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    next.set("radius", String(normalizeRadius(radiusDraft)));
    setSearchParams(next);
  }

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <Link to="/" className="btn btn-ghost btn-sm"><ArrowLeft aria-hidden="true" size={17} />New address</Link>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => window.print()}><FileDown aria-hidden="true" size={17} />Print / save as PDF</button>
      </div>

      <header className="mt-6 rounded-3xl border border-primary/20 bg-base-100 p-6 shadow-xl sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Your voter-information plan</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">{data.election.name}</h1>
            <p className="mt-3 flex items-start gap-2 text-base-content/75"><MapPinned aria-hidden="true" className="mt-0.5 shrink-0 text-primary" size={19} /><span>{normalized}</span></p>
          </div>
          <div className="rounded-2xl bg-primary/10 p-5 text-left sm:min-w-56">
            <p className="text-xs font-black uppercase tracking-wider text-base-content/60">Election day</p>
            <p className="mt-1 text-2xl font-black text-primary">{data.election.electionDay || "Date not provided"}</p>
            <p className="mt-2 text-sm text-base-content/65">Information retrieved for planning purposes.</p>
          </div>
        </div>
        {fallback ? <div className="alert alert-warning mt-6 items-start"><AlertTriangle aria-hidden="true" className="mt-0.5" /><div><h2 className="font-black">VIP Test Election — not a current election</h2><p className="mt-1 text-sm">The live election did not return usable voter information, so this deterministic test dataset is shown for development and verification. Do not use it to plan a real vote.</p></div></div> : null}
        <div className="mt-6 grid gap-3 border-t border-base-300 pt-5 sm:grid-cols-4">
          <SummaryStat label="Election-day locations" value={data.pollingLocations.length} />
          <SummaryStat label="Early-vote sites" value={data.earlyVoteSites.length} />
          <SummaryStat label="Drop-off locations" value={data.dropOffLocations.length} />
          <SummaryStat label="Contests / questions" value={data.contests.length} />
        </div>
        {data.mailOnly ? <p className="mt-5 rounded-xl bg-info/10 p-3 text-sm font-semibold text-base-content/75">The provider marked this response as mail-only. Review the official administration links for ballot-return instructions and deadlines.</p> : null}
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-10">
          <section className="no-print rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm" aria-labelledby="radius-heading">
            <div className="flex items-start gap-3">
              <Info aria-hidden="true" className="mt-1 text-primary" />
              <div className="flex-1">
                <h2 id="radius-heading" className="font-black">Nearby locations</h2>
                <p className="mt-1 text-sm leading-6 text-base-content/65">Showing locations within {plan.radiusMiles} miles of the geocoded address. The service keeps records without coordinates visible instead of silently dropping them.</p>
                <form className="mt-4 flex flex-wrap items-center gap-4" onSubmit={applyRadius}>
                  <label className="font-bold" htmlFor="radius">Search radius</label>
                  <input id="radius" name="radius" type="range" min="5" max="50" step="1" value={radiusDraft} onChange={(event) => setRadiusDraft(Number(event.target.value))} aria-valuetext={`${radiusDraft} miles`} className="range range-primary min-w-48 flex-1" />
                  <output htmlFor="radius" className="badge badge-primary badge-lg w-20">{radiusDraft} mi</output>
                  <button type="submit" className="btn btn-outline btn-sm">Apply radius</button>
                </form>
              </div>
            </div>
          </section>

          <div id="locations" className="space-y-10">
            <LocationSection title="Election-day locations" description="Civic identifies these as places where voting may be available on election day. The provider does not establish a single assigned location here; confirm eligibility and hours before traveling." results={plan.pollingLocations} emptyMessage="No coordinate-confirmed election-day locations were returned within this radius. Check the official location finder below and review records without coordinates." />
            <LocationSection title="Early-vote sites" description="Review the full hours text supplied by the provider. Early voting rules and eligibility can differ by jurisdiction." results={plan.earlyVoteSites} emptyMessage="No early-vote sites were returned within this radius." />
            <LocationSection title="Ballot drop-off locations" description="These records may describe places to return a ballot. Confirm that this option applies to your ballot and jurisdiction." results={plan.dropOffLocations} emptyMessage="No ballot drop-off locations were returned within this radius." />
          </div>

          <ContestSection contests={plan.contests} />
          <AdministrationSection records={plan.administration} />
          {data.otherElections.length ? <OtherElections address={data.address} elections={data.otherElections} /> : null}
          <DiscoveryPanel electionId={data.election.id} />
        </div>

        <aside className="no-print h-fit space-y-4 lg:sticky lg:top-6" aria-label="Plan navigation and data notes">
          <nav className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm" aria-label="Results sections">
            <h2 className="font-black">Jump to</h2>
            <ul className="mt-3 space-y-2 text-sm font-bold">
              <li><a className="link link-primary" href="#locations">Locations and hours</a></li>
              <li><a className="link link-primary" href="#contests-heading">Contests and candidates</a></li>
              <li><a className="link link-primary" href="#administration-heading">Official contacts</a></li>
            </ul>
          </nav>
          <div className="rounded-2xl border border-base-300 bg-base-100 p-5 text-sm shadow-sm">
            <h2 className="font-black">About this result</h2>
            <p className="mt-2 leading-6 text-base-content/70">Retrieved {new Date(data.retrieval.retrievedAt).toLocaleString()} from the server-side Civic integration. Provider source labels are preserved on each section.</p>
            {data.otherElections.length ? <p className="mt-3 leading-6 text-base-content/70">The provider also listed {data.otherElections.length} other election option(s).</p> : null}
            <p className="mt-3 flex items-start gap-2 leading-6 text-base-content/70"><ListChecks aria-hidden="true" className="mt-0.5 shrink-0 text-primary" size={17} />Review the official links and confirm the final details with your election administrator.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function SummaryStat({ label, value }: { readonly label: string; readonly value: number }) {
  return <div><p className="text-2xl font-black text-primary">{value}</p><p className="text-xs font-bold uppercase tracking-wide text-base-content/60">{label}</p></div>;
}

function OtherElections({ address, elections }: { readonly address: string; readonly elections: readonly { id: string; name: string; electionDay: string }[] }) {
  return <section className="no-print rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm" aria-labelledby="other-elections-heading"><h2 id="other-elections-heading" className="text-xl font-black">Other elections for this address</h2><p className="mt-1 text-sm text-base-content/65">Choose another provider-listed election to request its information.</p><ul className="mt-4 space-y-2">{elections.map((election) => <li key={election.id}><Link className="link link-primary font-bold" to={`/voterinfo?address=${encodeURIComponent(address)}&electionId=${encodeURIComponent(election.id)}`}>{election.name} — {election.electionDay}</Link></li>)}</ul></section>;
}
