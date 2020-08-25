import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import Moment from 'react-moment';
import styled from 'styled-components';
import { Accordion, Button, Card } from 'react-bootstrap';

const IdLink = styled.a`
  color: blue;
  text-decoration: none;
  cursor: pointer;
`;

const ElectionInfo = (props) => {
  // const id = window.localStorage.getItem('id');
  // const address = JSON.parse(window.localStorage.getItem('address'));
  const [submitted, setSubmitted] = useState(null);
  const [id, setId] = useState(id, null);
  const [isOpen, setIsOpen] = useState(true);

  const url = '/api/elections';
  const fetcher = (url) => fetch(url).then((r) => r.json());
  const { data, error } = useSWR(url, fetcher);

  if (error)
    return (
      <div className='alert alert-danger' role='alert'>
        <span className='sr-only'>Failed to load data</span>
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

  if (
    (data && (data !== null) & !data.data.elections) ||
    data.data.elections.length <= 0 ||
    data.data.elections === null
  ) {
    return (
      <Card bg='danger' className='mb-3 shadow text-white'>
        <Card.Header>
          <h3 className='m-3 font-weight-bold'>
            Attention: General elections not found in database
          </h3>
        </Card.Header>
        <Card.Body>
          <h5 className='m-3'>
            If you are aware of an upcoming election, please contact your
            state's election office to ask for more info
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
    const { elections } = data.data;

    const handleClick = (event, id) => {
      event.preventDefault();
      console.log('Recording ' + id + ' to window.localStorage');
      window.localStorage.removeItem('id');
      window.localStorage.setItem('id', id);
      setSubmitted(true);
      setId(id);
    };

    const handleIsOpen = () => setIsOpen(!isOpen);

    return (
      <Accordion defaultActiveKey='0' onClick={handleIsOpen}>
        <Card className='mb-3 shadow'>
          <Accordion.Toggle
            as={Card.Header}
            eventKey='0'
            style={{ cursor: 'pointer' }}
          >
            <h3 className='card-header bg-primary text-white'>
              <span className='text-left'>Currently Available Elections:</span>
              <span className='float-right'>
                {isOpen && <i className='fas fa-times-circle'></i>}
                {!isOpen && <i className='fas fa-plus-circle'></i>}
              </span>
            </h3>
          </Accordion.Toggle>
          <Accordion.Collapse eventKey='0'>
            <Card.Body>
              <table className='table table-hover'>
                <thead style={{ fontFamily: 'Righteous, sans-serif' }}>
                  <tr>
                    <th scope='col'>#</th>
                    <th scope='col'>ID</th>
                    <th scope='col'>Name</th>
                    <th scope='col'>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {elections.map((election, idx) => (
                    <tr key={election.id}>
                      <th scope={idx}>{idx}</th>
                      <td>
                        <IdLink
                          onClick={(event, id) =>
                            handleClick(event, election.id)
                          }
                        >
                          {election.id}
                        </IdLink>
                      </td>
                      <td>{election.name}</td>
                      <td>
                        <Moment format='MM/DD/YYYY'>
                          {election.electionDay}
                        </Moment>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div>
                <p className='text-center'>
                  &uarr; Click on the election id in your area &uarr;
                </p>
              </div>
              <div>
                <p className='m-3 text-danger'>
                  Election ID submitted: {id || `no id submitted yet`}
                </p>
              </div>
              {elections.length < 50 && (
                <div className='card text-center'>
                  <h3 className='card-header'>
                    If there is no election listed in your area, please check
                    back later for updates
                  </h3>
                </div>
              )}
              <div className='m-3 text-center'>
                <Link href='/voterinfo'>
                  <button className='btn btn-primary btn-block'>
                    <h3>
                      Visit Voter Information Page{' '}
                      <div className='float-right'>
                        <i className='fas fa-arrow-alt-circle-right'></i>
                      </div>
                    </h3>
                  </button>
                </Link>
              </div>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    );
  }
};

export default ElectionInfo;
