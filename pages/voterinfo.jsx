import Head from 'next/head';
import Link from 'next/link';
import { Button } from 'react-bootstrap';
import { Jumbotron } from 'styles/styledComponents';
import CountdownTimer from 'Components/Cards/CountdownTimer';
import PollingLocations from 'Components/Cards/PollingLocations';
import GeneralElections from 'Components/Cards/GeneralElections';
import PrimaryElections from 'Components/Cards/PrimaryElections';
import Referendums from 'Components/Cards/Referendums';
import ServiceDisclaimer from 'Components/ServiceDisclaimer';
import IconsBar from 'Components/NavElements/IconsBar';

const VoterInfo = (props) => {
  return (
    <div>
      <Head>
        <title>Info for Voters</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className='container-fluid mt-3 bg-light'>
        <Jumbotron className='mb-3 text-white'>
          <h3>
            Thanks for using
            <span className='float-right'>
              <i className='fas fa-person-booth fa-5x'></i>
            </span>
          </h3>
          <h1 className='text-center font-weight-bold'>PLEASE VOTE&trade;</h1>
          <h5 className='text-center font-weight-bold'>
            Here's your voter info:
          </h5>
        </Jumbotron>
        <CountdownTimer
          endTime='2020-11-03'
          label='Time Left Until November 3rd:'
        />
        <PollingLocations />

        <GeneralElections />

        <PrimaryElections />

        <Referendums />

        <Link href='/'>
          <Button
            className='text-white font-weight-bold mt-3 mb-3 shadow'
            size='lg'
            block
            variant='primary'
          >
            <div>
              <i className='fas fa-arrow-alt-circle-left float-left fa-2x'></i>{' '}
              Return to Home Page
            </div>
          </Button>
        </Link>
      </main>
      <footer className='container-fluid'>
        <ServiceDisclaimer />
      </footer>
      <IconsBar />
    </div>
  );
};

export default VoterInfo;
