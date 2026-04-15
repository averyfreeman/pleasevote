import { useLoaderData, Link } from "react-router";
import { Users, Vote, List } from "lucide-react";
import CountdownTimer from "~/components/CountdownTimer";
import AddressInput from "~/components/AddressInput";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "PLEASE VOTE™ | Your Source for Election Info" },
    { name: "description", content: "Empowering voters with reliable information for every election." },
  ];
}

/**
 * Home Route Component.
 * Responsive refinements for desktop viewports (>800px).
 */
export default function Home() {
  return (
    <main className="container mx-auto px-4 pt-12 md:pt-24 pb-32">
      {/* Hero Section */}
      <section className="relative overflow-hidden mb-12 p-12 md:p-32 rounded-[3rem] bg-onehalf-green border-8 border-neutral-900 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center group transition-all hover:translate-x-2 hover:translate-y-2 hover:shadow-none min-h-[600px]">

        {/* Background Decorative Icons */}
        <div className="absolute top-12 left-12 opacity-10 group-hover:opacity-20 transition-opacity rotate-12 pointer-events-none z-0">
          <Users size={300} strokeWidth={1} className="text-neutral-900" />
        </div>
        <div className="absolute bottom-12 right-12 opacity-10 group-hover:opacity-20 transition-opacity -rotate-12 pointer-events-none z-0">
          <Vote size={300} strokeWidth={1} className="text-neutral-900" />
        </div>

        <div className="relative z-10 flex flex-col items-center w-full space-y-16">
          <h3 className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tighter uppercase leading-none">
            Welcome to
          </h3>

          <h1 className="text-6xl md:text-[10rem] lg:text-[12rem] font-black text-neutral-900 font-sans drop-shadow-2xl uppercase tracking-tightest leading-[0.9]">
            PLEASE VOTE<span className="text-5xl align-top ml-4 font-normal">™</span>
          </h1>

          <div className="h-4 w-64 bg-neutral-900/10 rounded-full" />

          <h5 className="text-xl md:text-4xl lg:text-5xl font-black text-neutral-900/80 font-sans max-w-6xl leading-tight uppercase italic tracking-tighter">
            Empowering voters with reliable information for every election.
          </h5>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Countdown Section */}
        <div className="lg:col-span-5">
          <CountdownTimer
            endTime="2026-11-03T00:00:00"
            label="2026 Midterm Elections Countdown"
          />

          <Link to="/elections" className="mt-8 flex items-center justify-center p-8 bg-onehalf-dark border-4 border-neutral-800 rounded-3xl text-onehalf-yellow font-black uppercase tracking-widest hover:border-onehalf-yellow transition-all group">
            <List size={32} className="mr-4 group-hover:rotate-12 transition-transform" />
            View All Elections
          </Link>
        </div>

        {/* Address Input Section */}
        <div className="lg:col-span-7 flex flex-col justify-center h-full space-y-6">
          <div className="p-8 md:p-12 lg:p-16 bg-neutral-900 rounded-3xl border-4 border-neutral-800 shadow-2xl flex flex-col items-center text-center">
            <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase text-onehalf-blue tracking-tighter">Find Your Polling Info</h2>
            <p className="text-neutral-400 text-lg md:text-xl mb-12 max-w-2xl">Enter your street address to see upcoming local contests, candidates, and polling locations for your district.</p>
            <AddressInput />
          </div>
        </div>
      </div>
    </main>
  );
}
