import { useLoaderData, Link } from "react-router";
import { useState } from "react";
import { ChevronLeft, Calendar, Info, ChevronDown, ChevronUp } from "lucide-react";
import type { Route } from "./+types/elections";
import { fetchElections } from "~/lib/api";
import type { Election } from "~/lib/types";

/**
 * Loader for the elections route.
 * Automatically fetches election data upon entry.
 */
export async function clientLoader() {
  try {
    const data = await fetchElections();
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Route metadata for elections page.
 */
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Election Directory | PLEASE VOTE™" },
    { name: "description", content: "View all upcoming and past election cycles in the US." },
  ];
}

/**
 * Elections Route Component.
 * Displays a list of elections with expandable details.
 */
export default function Elections() {
  const { data, error } = useLoaderData<typeof clientLoader>();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (error) {
    return (
      <main className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-6xl font-black text-red-500 mb-8 uppercase">Error</h1>
        <p className="text-2xl mb-12 text-neutral-400">{error}</p>
        <Link to="/" className="px-12 py-6 bg-onehalf-blue text-neutral-950 font-black rounded-2xl uppercase hover:scale-105 transition-all inline-block">
          Return Home
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <header className="mb-12 border-b-8 border-neutral-900 pb-12">
        <Link to="/" className="flex items-center text-onehalf-blue font-black uppercase mb-4 hover:translate-x-[-4px] transition-transform">
          <ChevronLeft className="mr-2" /> Back to Home
        </Link>
        <h1 className="text-6xl md:text-8xl font-black tracking-tightest uppercase mb-4">
          Elections<span className="text-onehalf-green">.</span>
        </h1>
        <p className="text-2xl font-bold text-neutral-400 max-w-2xl">
          Complete directory of all election cycles registered with the Voting Information Project.
        </p>
      </header>

      <div className="space-y-6">
        {data?.elections.map((election: Election) => (
          <div
            key={election.id}
            className={`bg-onehalf-dark rounded-[2rem] border-4 transition-all overflow-hidden ${
              expandedId === election.id ? "border-onehalf-blue shadow-2xl scale-[1.01]" : "border-neutral-800 hover:border-neutral-600"
            }`}
          >
            <div
              className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
              onClick={() => setExpandedId(expandedId === election.id ? null : election.id)}
            >
              <div className="flex items-start gap-6">
                <div className="p-4 bg-neutral-900 rounded-2xl text-onehalf-yellow border-2 border-neutral-800">
                  <Calendar size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase leading-tight">{election.name}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-neutral-500 font-mono text-sm uppercase">ID: {election.id}</span>
                    <span className="text-onehalf-green font-black italic">{election.electionDay}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="text-onehalf-blue font-black uppercase tracking-widest text-sm flex items-center hover:underline">
                  {expandedId === election.id ? (
                    <>Hide Details <ChevronUp size={20} className="ml-2" /></>
                  ) : (
                    <>View Details <ChevronDown size={20} className="ml-2" /></>
                  )}
                </button>
              </div>
            </div>

            {expandedId === election.id && (
              <div className="px-8 pb-8 pt-4 border-t-4 border-neutral-900 bg-neutral-900/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500">OCD Division ID</h3>
                    <div className="p-4 bg-onehalf-dark rounded-xl font-mono text-sm text-onehalf-blue border-2 border-neutral-800 break-all">
                      {election.ocdDivisionId}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500">API Payload (Raw)</h3>
                    <pre className="p-4 bg-black rounded-xl font-mono text-[10px] text-neutral-400 border-2 border-neutral-800 overflow-x-auto max-h-48">
                      {JSON.stringify(election, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
