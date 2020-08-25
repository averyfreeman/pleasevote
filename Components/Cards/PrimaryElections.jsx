import { Fragment, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Accordion, Button, Card } from 'react-bootstrap';

const PrimaryElections = (props) => {
  const [isOpen, setIsOpen] = useState(true);

  const address = JSON.parse(window.localStorage.getItem('address'));
  const id = window.localStorage.getItem('id');
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

  if (
    (data && (data !== null) & !data.data.contests) ||
    data.data.contests.length <= 0 ||
    data.data.contests === null
  ) {
    return (
      <Card bg='success' className='mb-3 shadow text-white'>
        <Card.Header>
          <h3 className='m-3 font-weight-bold'>
            Attention: Primary elections not found in database
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
    const { contests } = data.data;

    const primaryElections = [];
    contests.map((contest) => {
      if (contest.type === 'Primary') {
        primaryElections.push(contest);
      }
    });

    const handleIsOpen = () => setIsOpen(!isOpen);

    // console.log(primaryElections);

    return (
      <Accordion defaultActiveKey='0' onClick={handleIsOpen}>
        <Card className='mb-3 shadow'>
          <Accordion.Toggle
            as={Card.Header}
            eventKey='0'
            style={{ cursor: 'pointer' }}
          >
            <h3 className='card-header bg-primary text-white'>
              <span className='text-left'>Upcoming Primary Election(s)</span>
              <span className='float-right'>
                {isOpen && <i className='fas fa-times-circle'></i>}
                {!isOpen && <i className='fas fa-plus-circle'></i>}
              </span>
            </h3>
          </Accordion.Toggle>
          <Accordion.Collapse eventKey='0'>
            <Card.Body>
              <table className='table table-striped table-hover'>
                {primaryElections.length > 0 && (
                  <caption>
                    List of primary election contests in your area
                  </caption>
                )}
                {primaryElections.length <= 0 && (
                  <caption>No primary election info found</caption>
                )}
                {primaryElections.length > 0 && (
                  <Fragment>
                    <thead style={{ fontFamily: 'Space Mono, sans-serif' }}>
                      <tr>
                        <th scope='col' style={{ width: '10px' }}>
                          #
                        </th>
                        <th scope='col'>Office</th>
                        <th scope='col'>District</th>
                        <th scope='col'>Scope</th>
                      </tr>
                      <tr>
                        <th scope='col'></th>
                        <th scope='col'>Candidates</th>
                        <th scope='col'>Partisan Affiliation</th>
                        <th scope='col'>Jurisdiction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {primaryElections.map((election, idx) => (
                        <Fragment key={idx}>
                          <tr className='font-weight-bold'>
                            {/* <td style={{ width: '10px' }}>{idx + 1}</td> */}
                            <td
                              style={{ width: '10px', verticalAlign: 'middle' }}
                            >
                              <b>{idx + 1}</b>
                            </td>
                            <td>{election.office}</td>
                            <td>{election.district.name}</td>
                            <td>{election.district.scope}</td>
                          </tr>
                          <tr>
                            <td></td>
                            <td>
                              {election.candidates.map((item, idx) => (
                                <div key={idx}>{item.name}</div>
                              ))}
                            </td>
                            <td>
                              {election.candidates.map((item, idx) => (
                                <div key={idx}>{item.party}</div>
                              ))}
                            </td>
                            <td>
                              {election.level.map((item, idx) => (
                                <div key={idx}>{item}</div>
                              ))}
                            </td>
                          </tr>
                        </Fragment>
                      ))}
                    </tbody>
                  </Fragment>
                )}
              </table>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    );
  }
};

export default PrimaryElections;
