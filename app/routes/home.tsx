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
              Find the details before you go.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-base-content/75">
              <strong>
                Gather all the information you need in one place: 
              </strong>
            </p>
            <ul className="mt-4 mb-4 list-disc list-inside text-lg text-base-content/75 space-y-1">
              <li>election dates</li>
              <li>contests and candidates</li>
              <li>polling locations</li>
              <li>early voting</li>
              <li>ballot drop-off locations</li>
              <li>links to your local election office</li>
            </ul>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-base-content/75">
              <strong>
                 We'll help you print them all out with directions so you can have a concrete plan for when and where to vote!
              </strong>
            </p>
            <div className="mt-8 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-lg">
              <h2 className="text-xl font-extrabold">Enter your address</h2>
              <p className="mt-1 text-sm text-base-content/65">We use it to find the election information most relevant to you.</p>
              <div className="mt-5">
                <AddressInput elections={elections} />
              </div>
              <p className="mt-4 rounded-xl border border-info/25 bg-info/10 p-3 text-sm leading-6 text-base-content/75">Election information may not be available yet. Historically, details have often become available 2–4 weeks before Election Day—usually in early to mid-October. Check back closer to Election Day and confirm details with your local election office.</p>
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
                  <h2 className="font-extrabold">What you’ll find here</h2>
                  <p className="mt-1 text-sm leading-6 text-base-content/70">Clear dates, places, hours, contests, and official links in one place—so you can make a plan with confidence.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3" aria-labelledby="promise-heading">
        <h2 id="promise-heading" className="sr-only">PleaseVote promises</h2>
        {[
          { icon: ShieldCheck, title: "Official sources", text: "Source labels stay visible, so you know what to trust and what to confirm." },
          { icon: CheckCircle2, title: "The full picture", text: "See places, hours, contests, candidates, questions, and election-office links together." },
          { icon: ExternalLink, title: "Ready when you are", text: "Get directions, open official links, or print the details for later." },
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
