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
        <link rel='icon' href='/favicon.png' />
      </Head>

      <main className="container mx-auto px-4 pt-8">
        {/* Jumbotron Replacement */}
        <section className="relative overflow-hidden mb-8 p-12 rounded-2xl bg-onehalf-green border-4 border-onehalf-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center group transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
          <div className="absolute -top-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
            <Users size={200} className="text-onehalf-dark" />
          </div>

          <div className="relative z-20">
            <h3 className="text-2xl font-righteous text-onehalf-dark mb-2 tracking-tight">
              Welcome to
            </h3>

            <h1 className="text-6xl md:text-8xl font-black text-onehalf-dark font-righteous mb-4 drop-shadow-xl uppercase tracking-tighter">
              PLEASE VOTE<span className="text-4xl align-top">™</span>
            </h1>

            <h5 className="text-xl md:text-2xl font-bold text-onehalf-dark/80 font-righteous max-w-2xl leading-relaxed">
              Empowering voters with reliable information for every election.
            </h5>
          </div>
        </section>

        {/* Countdown Section */}
        <CountdownTimer
          endTime='2026-11-03'
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
