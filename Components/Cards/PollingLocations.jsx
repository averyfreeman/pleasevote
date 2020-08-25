import { Fragment, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Accordion, Button, Card } from 'react-bootstrap';

const PollingLocations = (props) => {
  const [isOpen, setIsOpen] = useState(true);

  const address = JSON.parse(window.localStorage.getItem('address'));
  const id = window.localStorage.getItem('id');
  console.log(address, id);
  const url = `/api/voterInfo?id=${id}&address=${address}`;
  const fetcher = (url) => fetch(url).then((r) => r.json());
  const { data, error } = useSWR(url, fetcher);

  if (error)
    return (
      <div className='alert alert-danger' role='alert'>
        <span className='sr-only'>Failed to load data!</span>
      </div>
    );

  if (!data)
    return (
      <div
        className='spinner-border spinner-border-lg text-danger'
        role='status'
        style={{ margin: '10rem', width: '20rem', height: '20rem' }}
      ></div>
    );

  const handleIsOpen = () => setIsOpen(!isOpen);

  if (
    (data && (data !== null) & !data.data.pollingLocations) ||
    data.data.pollingLocations.length <= 0 ||
    data.data.pollingLocations === null
  ) {
    return (
      <Card bg='danger' className='mb-3 shadow text-white'>
        <Card.Header>
          <h3 className='m-3 font-weight-bold'>
            Attention: Polling locations not found in database.
          </h3>
        </Card.Header>
        <Card.Body>
          <h5 className='m-3'>
            Please contact your state's Secretary of State office to ask where
            your local polling location is located
          </h5>
          <Link href='https://www.usa.gov/election-office'>
            <a
              className='m-3 font-weight-bold'
              style={{ textTransform: 'uppercase', color: 'black' }}
              target='_blank'
            >
              <div className='text-center'>
                <i className='fas fa-info-circle fa-2x'></i> &nbsp;Click here to
                search for your state&nbsp;{' '}
                <i className='fas fa-question-circle fa-2x'></i>
              </div>
            </a>
          </Link>
        </Card.Body>
      </Card>
    );
  }

  if (data && data !== null) {
    const { pollingLocations } = data.data;

    return (
      <Accordion defaultActiveKey='0' onClick={handleIsOpen}>
        <Card className='mb-3 shadow'>
          <Accordion.Toggle
            as={Card.Header}
            eventKey='0'
            style={{ cursor: 'pointer' }}
          >
            <h3 className='card-header bg-primary text-white'>
              <span className='text-left'>
                Available Polling Location(s) &nbsp;
              </span>
              <span className='float-right'>
                {isOpen && <i className='fas fa-times-circle'></i>}
                {!isOpen && <i className='fas fa-plus-circle'></i>}
              </span>
            </h3>
          </Accordion.Toggle>
          <Accordion.Collapse eventKey='0'>
            <Card.Body>
              {pollingLocations.length > 0 && (
                <Card className='m-3'>
                  {pollingLocations.map((location, idx) => (
                    <Fragment key={idx}>
                      <div
                        className='card-header'
                        style={{ fontFamily: 'Righteous, sans-serif' }}
                      >
                        <h3 className='card-title'>
                          {location.address.locationName}
                        </h3>
                      </div>
                      <div className='card-body text-center'>
                        <h3 className='card-text'>Address:</h3>
                        <div className='display-4 font-weight-bold'>
                          <p className='card-text'>{location.address.line1}</p>
                          <p className='card-text'>{location.address.line2}</p>
                          <p className='card-text'>
                            {location.address.city}, {location.address.state}{' '}
                            {location.address.zip}
                          </p>
                        </div>
                      </div>
                      <div className='card-footer'>
                        <h3 className='card-title text-center'>
                          Location hours and information:
                        </h3>
                        <div className='font-weight-bold'>
                          <p className='card-text'>{location.pollingHours}</p>
                        </div>
                        <div className='card-body'>
                          <p className='card-title'>
                            Source: {location.sources[0].name}
                          </p>
                          {location.sources[0].official && (
                            <p className='card-text'>(Verified source) </p>
                          )}
                        </div>
                      </div>
                    </Fragment>
                  ))}
                </Card>
              )}
              {pollingLocations.length < 0 && (
                <div className='jumbotron'>
                  <p>No polling locations shown at this time</p>
                </div>
              )}
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    );
  }
};

export default PollingLocations;
