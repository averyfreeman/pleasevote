import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import {
  Users,
  MapPin,
  Calendar,
  ArrowRightCircle,
  Vote,
  Info,
  ExternalLink
} from 'lucide-react';

import CountdownTimer from 'Components/Cards/CountdownTimer';
import AddressModal from 'Components/Modals/AddressModal';
import ElectionInfoModal from 'Components/Modals/ElectionInfoModal';
import VoterRegCard from 'Components/Cards/VoterRegCard';
import StoredInfoCard from 'Components/Cards/StoredInfoCard';
import ServiceDisclaimer from 'Components/ServiceDisclaimer';
import IconsBar from 'Components/NavElements/IconsBar';

const Home = () => {
  const [addressModal, showAddressModal] = useState(false);
  const [electionModal, showElectionModal] = useState(false);
  const [hasStoredValues, setHasStoredValues] = useState(false);

  useEffect(() => {
    const address = window.localStorage.getItem('address');
    const id = window.localStorage.getItem('id');
    setHasStoredValues(!!(address || id));
  }, []);

  const handleAddressModal = () => showAddressModal(!addressModal);
  const handleElectionModal = () => showElectionModal(!electionModal);

  return (
    <div className="min-h-screen pb-32 bg-onehalf-dark selection:bg-onehalf-blue selection:text-onehalf-dark">
      <Head>
        <title>PLEASE VOTE™ | Your Source for Election Info</title>
        <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192"  href="/android-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff" />
      </Head>

      <main className="container mx-auto px-4 pt-8">
        {/* Jumbotron Replacement (Hero Section) */}
        <section className="relative overflow-hidden mb-8 p-12 md:p-24 rounded-2xl bg-onehalf-green border-4 border-onehalf-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center group transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none min-h-[600px]">

          {/* Background Decorative Icons: Moved to corners and reduced opacity to zero-overlap with text */}
          <div className="absolute top-8 left-8 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 pointer-events-none z-0">
            <Users size={200} strokeWidth={1} className="text-onehalf-dark" />
          </div>
          <div className="absolute bottom-8 right-8 opacity-5 group-hover:opacity-10 transition-opacity -rotate-12 pointer-events-none z-0">
            <Vote size={200} strokeWidth={1} className="text-onehalf-dark" />
          </div>

          <div className="relative z-10 flex flex-col items-center w-full space-y-16">
            {/* Header subtext: "Welcome to"
                Added tracking-widest and removed leading-none to ensure it stays above the title. */}
            <h3 className="text-2xl md:text-4xl font-righteous text-onehalf-dark tracking-widest uppercase">
              Welcome to
            </h3>

            {/* Main Title: "PLEASE VOTE™"
                Changed leading-tight to leading-[1.1] for more precise control over the massive font's line box. */}
            <h1 className="text-6xl md:text-9xl font-black text-onehalf-dark font-righteous drop-shadow-2xl uppercase tracking-tighter leading-[1.1]">
              PLEASE VOTE<span className="text-4xl align-top ml-2">™</span>
            </h1>

            {/* Tagline: "Empowering voters..."
                Added a top border for visual separation and more padding. */}
            <h5 className="text-xl md:text-3xl font-bold text-onehalf-dark/80 font-righteous max-w-4xl leading-relaxed pt-8 border-t-2 border-onehalf-dark/10">
              Empowering voters with reliable information for every election.
            </h5>
          </div>
        </section>

        {/* Countdown Section */}
        <CountdownTimer
          endTime='2026-11-03T00:00:00'
          label='Time Left Until the 2026 Midterm Elections:'
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <VoterRegCard />
          <StoredInfoCard />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <button
            onClick={handleAddressModal}
            className="flex flex-col items-center justify-center p-8 transition-all bg-onehalf-yellow text-onehalf-dark rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 focus:ring-4 focus:ring-onehalf-yellow/50"
          >
            <MapPin size={48} className="mb-4" />
            <span className="text-2xl font-black font-righteous uppercase">Enter Address</span>
          </button>

          <button
            onClick={handleElectionModal}
            className="flex flex-col items-center justify-center p-8 transition-all bg-onehalf-green text-onehalf-dark rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 focus:ring-4 focus:ring-onehalf-green/50"
          >
            <Calendar size={48} className="mb-4" />
            <span className="text-2xl font-black font-righteous uppercase text-center">Choose Election</span>
          </button>

          <Link href='/voterinfo'>
            <a className={`flex flex-col items-center justify-center p-8 transition-all bg-onehalf-blue text-onehalf-dark rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 focus:ring-4 focus:ring-onehalf-blue/50 ${!hasStoredValues && 'opacity-50 grayscale'}`}>
              <ArrowRightCircle size={48} className="mb-4" />
              <span className="text-2xl font-black font-righteous uppercase text-center">Continue Stored</span>
            </a>
          </Link>
        </div>

        <AddressModal show={addressModal} onHide={handleAddressModal} />
        <ElectionInfoModal show={electionModal} onHide={handleElectionModal} />
      </main>

      <footer className="container mx-auto px-4 pb-20">
        <ServiceDisclaimer />
      </footer>

      <IconsBar />
    </div>
  );
};

export default Home;
