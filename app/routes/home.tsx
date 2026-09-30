import { CalendarDays, CheckCircle2, ExternalLink, HeartHandshake, ShieldCheck } from "lucide-react";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/home";

import AddressInput from "~/components/AddressInput";
import CountdownTimer from "~/components/CountdownTimer";
import { fetchElections } from "~/lib/api";
import type { ElectionSummary } from "~/lib/types";

const FALLBACK_ELECTION: ElectionSummary = {
  id: "12000",
  name: "2026 General Election",
  electionDay: "2026-11-03",
};

/** Load a best-effort upcoming election without blocking the address workflow. */
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  try {
    const response = await fetchElections(request.signal);
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = response.elections
      .filter((election) => election.electionDay >= today)
      .sort((left, right) => left.electionDay.localeCompare(right.electionDay))[0];
    return { election: upcoming ?? response.elections[0] ?? FALLBACK_ELECTION, elections: response.elections };
  } catch {
    return { election: FALLBACK_ELECTION, elections: [] };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "PleaseVote | Official voter information" },
    { name: "description", content: "Find election-day locations, early voting, ballot drop-off, contests, and official election links." },
  ];
}

/** Explain the product's neutral information purpose and start the lookup. */
export default function Home() {
  const { election, elections } = useLoaderData<typeof clientLoader>();

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/15 via-base-100 to-secondary/15 p-6 shadow-xl sm:p-10 lg:p-14">
        <div className="pointer-events-none absolute -right-12 -top-16 select-none text-[11rem] opacity-10" aria-hidden="true">🦄</div>
        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-base-100 px-3 py-1 text-sm font-bold text-primary shadow-sm">
              <HeartHandshake aria-hidden="true" size={16} />
              Information for every voter
            </div>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-base-content sm:text-6xl">
              Know where, when, and what to expect before you go.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-base-content/75">
              PleaseVote brings together official election information for an address: election-day locations, early voting, ballot drop-off, contests, candidates, and election-administration links.
            </p>
            <div className="mt-8 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-lg">
              <h2 className="text-xl font-extrabold">Start with an address</h2>
              <p className="mt-1 text-sm text-base-content/65">A street address helps the Civic Information service return the most relevant records.</p>
              <div className="mt-5">
                <AddressInput elections={elections} />
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <CountdownTimer
              endTime={`${election.electionDay}T00:00:00`}
              label={`${election.name} countdown`}
            />
            <div className="rounded-2xl border border-secondary/25 bg-base-100 p-5 shadow-md">
              <div className="flex items-start gap-3">
                <CalendarDays aria-hidden="true" className="mt-0.5 shrink-0 text-secondary" />
                <div>
                  <h2 className="font-extrabold">What this site does</h2>
                  <p className="mt-1 text-sm leading-6 text-base-content/70">It helps you retrieve and organize voter information. It does not register you, endorse candidates, or cast a ballot.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3" aria-labelledby="promise-heading">
        <h2 id="promise-heading" className="sr-only">PleaseVote promises</h2>
        {[
          { icon: ShieldCheck, title: "Official context", text: "Provider source labels stay visible, so you can tell what is official and what needs confirmation." },
          { icon: CheckCircle2, title: "A complete plan", text: "Results combine places, hours, contests, candidates, referenda, and administration links in one view." },
          { icon: ExternalLink, title: "Your next step", text: "Use directions, official links, or the print view to take the information with you." },
        ].map(({ icon: Icon, title, text }) => (
          <article key={title} className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <Icon aria-hidden="true" className="text-primary" />
            <h3 className="mt-3 font-extrabold">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-base-content/70">{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
