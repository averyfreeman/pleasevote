import { ExternalLink, UserRound } from "lucide-react";
import type { Contest } from "~/lib/types";

function contestTitle(contest: Contest): string {
  return contest.office || contest.referendumTitle || "Ballot question or contest";
}

/** Render every contest as a keyboard-operable disclosure, preserving sparse provider fields. */
export default function ContestSection({ contests }: { readonly contests: readonly Contest[] }) {
  return (
    <section className="print-break-before" aria-labelledby="contests-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="contests-heading" className="text-2xl font-black tracking-tight">Contests, candidates, and questions</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-base-content/65">Open any item to review the provider's details. This list is not an endorsement and does not tell you how to vote.</p>
        </div>
        <span className="badge badge-secondary badge-lg">{contests.length} total</span>
      </div>
      {contests.length ? (
        <div className="mt-4 space-y-3">
          {contests.map((contest) => (
            <details key={contest.id} className="group rounded-2xl border border-base-300 bg-base-100 shadow-sm">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 font-bold focus-visible:outline-4 focus-visible:outline-primary/40">
                <span>
                  <span className="badge badge-ghost mb-2">{contest.type || "Contest"}</span>
                  <span className="block text-lg">{contestTitle(contest)}</span>
                  {contest.district?.name ? <span className="mt-1 block text-sm font-medium text-base-content/60">{contest.district.scope ? `${contest.district.scope}: ` : ""}{contest.district.name}</span> : null}
                </span>
                <span aria-hidden="true" className="text-2xl text-primary transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="border-t border-base-300 p-5">
                {contest.candidates.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {contest.candidates.map((candidate) => (
                      <article key={`${contest.id}-${candidate.name}`} className="rounded-xl border border-base-300 bg-base-200 p-4">
                        <div className="flex items-start gap-3">
                          {candidate.photoUrl ? <img className="size-12 rounded-full object-cover" src={candidate.photoUrl} alt="" /> : <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"><UserRound aria-hidden="true" /></span>}
                          <div className="min-w-0">
                            <h3 className="font-extrabold">{candidate.name}</h3>
                            {candidate.party ? <p className="text-sm text-base-content/65">{candidate.party}</p> : null}
                            {candidate.phone ? <p className="mt-2 text-sm">{candidate.phone}</p> : null}
                            {candidate.email ? <p className="break-all text-sm">{candidate.email}</p> : null}
                          </div>
                        </div>
                        {candidate.candidateUrl ? <a className="btn btn-ghost btn-sm mt-3" href={candidate.candidateUrl} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" size={15} />Candidate details<span className="sr-only"> (opens in a new tab)</span></a> : null}
                      </article>
                    ))}
                  </div>
                ) : null}
                {contest.referendumSubtitle ? <p className="mt-4 whitespace-pre-line leading-7 text-base-content/80">{contest.referendumSubtitle}</p> : null}
                {contest.referendumUrl ? <a className="btn btn-outline btn-sm mt-4" href={contest.referendumUrl} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" size={15} />Question details<span className="sr-only"> (opens in a new tab)</span></a> : null}
                {!contest.candidates.length && !contest.referendumSubtitle && !contest.referendumUrl ? <p className="text-sm italic text-base-content/60">The provider did not include additional details for this item.</p> : null}
                {contest.sources.length ? <p className="mt-4 text-xs text-base-content/55">Source: {contest.sources.map((source) => source.name || "Unspecified provider").join(", ")}</p> : null}
              </div>
            </details>
          ))}
        </div>
      ) : <div className="mt-4 rounded-2xl border border-dashed border-base-300 bg-base-100 p-6 text-sm text-base-content/70">No contests were returned for this election and address. Confirm with the official administrator if you expected ballot information.</div>}
    </section>
  );
}
