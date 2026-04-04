import Head from 'next/head';
import Link from 'next/link';
import {
  ArrowLeftCircle,
  Users,
  ChevronLeft
} from 'lucide-react';

import CountdownTimer from 'Components/Cards/CountdownTimer';
import PollingLocations from 'Components/Cards/PollingLocations';
import GeneralElections from 'Components/Cards/GeneralElections';
import PrimaryElections from 'Components/Cards/PrimaryElections';
import Referendums from 'Components/Cards/Referendums';
import ServiceDisclaimer from 'Components/ServiceDisclaimer';
import IconsBar from 'Components/NavElements/IconsBar';

const VoterInfo = () => {
  return (
    <div className="min-h-screen pb-32 bg-onehalf-dark selection:bg-onehalf-blue selection:text-onehalf-dark">
      <Head>
        <title>Voter Information | PLEASE VOTE™</title>
        <link rel='icon' href='/favicon.png' />
      </Head>

      <main className="container mx-auto px-4 pt-8">
        {/* Header Section */}
        <section className="relative overflow-hidden mb-8 p-10 rounded-2xl bg-onehalf-blue border-4 border-onehalf-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center group transition-all">
          <div className="absolute -top-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
            <Users size={180} className="text-onehalf-dark" />
          </div>

          <div className="relative z-20">
            <h3 className="text-2xl font-righteous text-onehalf-dark mb-2 tracking-tight">
              Thanks for using
            </h3>

            <h1 className="text-5xl md:text-7xl font-black text-onehalf-dark font-righteous mb-4 drop-shadow-lg uppercase tracking-tighter">
              PLEASE VOTE<span className="text-3xl align-top">™</span>
            </h1>

            <h5 className="text-xl md:text-2xl font-bold text-onehalf-dark/80 font-righteous">
              Here's your personalized voter information:
            </h5>
          </div>
        </section>

        {/* Countdown Section */}
        <CountdownTimer
          endTime='2026-11-03'
          label='Time Remaining Until the 2026 Midterm Elections:'
        />

        <div className="space-y-8">
          <PollingLocations />
          <GeneralElections />
          <PrimaryElections />
          <Referendums />
        </div>

        {/* Navigation Action */}
        <div className="mt-12 mb-16">
          <Link href='/'>
            <a className="flex items-center justify-center w-full p-6 text-2xl font-black font-righteous uppercase transition-all bg-onehalf-green text-onehalf-dark rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 focus:ring-4 focus:ring-onehalf-green/50">
              <ChevronLeft size={48} className="mr-4" />
              Return to Home Page
            </a>
          </Link>
        </div>
      </main>

      <footer className="container mx-auto px-4">
        <ServiceDisclaimer />
      </footer>

      <IconsBar />
    </div>
  );
};

export default VoterInfo;
