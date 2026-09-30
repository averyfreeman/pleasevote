import { ExternalLink, Landmark } from "lucide-react";
import type { AdministrationInfo } from "~/lib/types";

const links: readonly [keyof AdministrationInfo, string][] = [
  ["electionInfoUrl", "Election information"],
  ["electionRegistrationUrl", "Register or check registration"],
  ["electionRegistrationConfirmationUrl", "Confirm registration"],
  ["votingLocationFinderUrl", "Official location finder"],
  ["ballotInfoUrl", "Sample ballot information"],
  ["electionRulesUrl", "Voting rules"],
];

/** Present official election-administration references without hiding provenance. */
export default function AdministrationSection({ records }: { readonly records: readonly AdministrationInfo[] }) {
  return (
    <section aria-labelledby="administration-heading">
      <div className="flex items-center gap-3">
        <Landmark aria-hidden="true" className="text-primary" />
        <h2 id="administration-heading" className="text-2xl font-black tracking-tight">Official election contacts and links</h2>
      </div>
      {records.length ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {records.map((record, index) => (
            <article key={`${record.name || "administration"}-${index}`} className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
              <h3 className="font-extrabold">{record.name || "Election administration"}</h3>
              {record.jurisdiction ? <p className="mt-1 text-sm text-base-content/65">{record.jurisdiction}</p> : null}
              <div className="mt-4 flex flex-col items-start gap-2">
                {links.map(([field, label]) => {
                  const url = record[field];
                  return typeof url === "string" ? <a key={field} className="link link-primary inline-flex items-center gap-2 text-sm font-bold" href={url} target="_blank" rel="noreferrer">{label}<ExternalLink aria-hidden="true" size={14} /><span className="sr-only"> (opens in a new tab)</span></a> : null;
                })}
              </div>
              {record.correspondenceAddress ? <p className="mt-4 border-t border-base-300 pt-3 text-sm text-base-content/70">Correspondence address: {[record.correspondenceAddress.line1, record.correspondenceAddress.city, record.correspondenceAddress.state, record.correspondenceAddress.zip].filter(Boolean).join(", ")}</p> : null}
              <p className="mt-4 text-xs text-base-content/55">Source: {record.sources.map((source) => source.name || "Unspecified provider").join(", ") || "Not specified"}</p>
            </article>
          ))}
        </div>
      ) : <p className="mt-4 rounded-2xl border border-dashed border-base-300 bg-base-100 p-5 text-sm text-base-content/70">No administration links were returned. Use your state or local election office to confirm information.</p>}
    </section>
  );
}
