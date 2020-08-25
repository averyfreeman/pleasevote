import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Button } from 'react-bootstrap';
import { Jumbotron } from 'styles/styledComponents';

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

  const handleAddressModal = () => showAddressModal(!addressModal);

  const handleElectionModal = () => showElectionModal(!electionModal);

  return (
    <div>
      <Head>
        <title>PLEASE VOTE™</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className='container-fluid mt-3 bg-light'>
        <Jumbotron className='mb-3 text-white'>
          <h3>
            Welcome to
            <span className='float-right'>
              <i className='fas fa-person-booth fa-5x'></i>
            </span>
          </h3>
          <h1 className='text-light text-center font-weight-bold'>
            PLEASE VOTE&trade;
          </h1>
          <h5 className='text-light text-center font-weight-bold'>
            Your Source for Election Info
          </h5>
        </Jumbotron>

        <CountdownTimer
          endTime='2020-11-03'
          label='Time Left Until November 3rd:'
        />

        <VoterRegCard />

        <StoredInfoCard />

        <div className='text-center'>
          <Button
            className='text-black font-weight-bold mt-3 mb-3 shadow'
            variant='warning'
            size='lg'
            block
            onClick={handleAddressModal}
          >
            <div>
              <i className='fas fa-house-user fa-2x float-right'></i>
            </div>
            <div>Enter New Address</div>
          </Button>

          <Button
            className='text-white font-weight-bold mt-3 mb-3 shadow'
            variant='success'
            size='lg'
            block
            onClick={handleElectionModal}
          >
            <div>
              <i className='fas fa-table fa-2x float-right'></i>
            </div>
            <div>Choose Your Election</div>
          </Button>

          <Link href='/voterinfo'>
            <Button size='lg' block className='font-weight-bold mb-5 shadow'>
              <div>
                <i className='fas fa-arrow-alt-circle-right fa-2x float-right'></i>{' '}
              </div>
              <div className='text-center'>Continue with Stored Values</div>
            </Button>
          </Link>
        </div>

        <AddressModal show={addressModal} onHide={handleAddressModal} />

        <ElectionInfoModal show={electionModal} onHide={handleElectionModal} />
      </main>
      <footer>
        <ServiceDisclaimer />
      </footer>
      <IconsBar />
    </div>
  );
};

export default Home;
