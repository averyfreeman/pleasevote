import { Fragment, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Accordion, Button, Card } from 'react-bootstrap';

const Referendums = (props) => {
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
      <Card bg='dark' className='mb-3 shadow text-white'>
        <Card.Header>
          <h3 className='m-3 font-weight-bold'>
            Attention: Referendums not found in database
          </h3>
        </Card.Header>
        <Card.Body>
          <h5 className='m-3'>
            If you are aware of an upcoming referendum, please contact your
            state's election office to ask for more info
          </h5>
          <Link href='https://www.usa.gov/election-office'>
            <a
              className='m-3 font-weight-bold'
              style={{ textTransform: 'uppercase', color: 'black' }}
              target='_blank'
            >
              <div className='text-center text-primary'>
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
    const generalElections = [];
    const referendums = [];
    contests.map((contest) => {
      if (contest.type === 'Referendum') {
        referendums.push(contest);
      } else if (contest.type === 'General') {
        generalElections.push(contest);
      } else if (contest.type === 'Primary') {
        primaryElections.push(contest);
      }
    });

    const handleIsOpen = () => setIsOpen(!isOpen);
    // console.log(referendums);

    return (
      <Accordion defaultActiveKey='0' onClick={handleIsOpen}>
        <Card className='mb-3 shadow'>
          <Accordion.Toggle
            as={Card.Header}
            eventKey='0'
            style={{ cursor: 'pointer' }}
          >
            <h3 className='card-header bg-primary text-white'>
              <span className='text-left'>Upcoming Referendum(s)</span>
              <span className='float-right'>
                {isOpen && <i className='fas fa-times-circle'></i>}
                {!isOpen && <i className='fas fa-plus-circle'></i>}
              </span>
            </h3>
          </Accordion.Toggle>
          <Accordion.Collapse eventKey='0'>
            <Card.Body>
              <table className='table table-striped table-hover'>
                {referendums.length > 0 && (
                  <caption>List of referendum info in your area</caption>
                )}
                {referendums.length <= 0 && (
                  <caption>No referendums found</caption>
                )}
                {referendums.length > 0 && (
                  <Fragment>
                    <thead style={{ fontFamily: 'Righteous, sans-serif' }}>
                      <tr>
                        <th scope='col' style={{ width: '10px' }}>
                          #
                        </th>
                        <th scope='col'>Title</th>
                        <th scope='col'>District</th>
                      </tr>
                      <tr>
                        <th></th>
                        {/* <th scope='col'>Information Website</th> */}
                        <th scope='col'>Subtitle</th>
                        <th scope='col'>Scope</th>
                        {/* </tr>
                      <tr>
                        <th></th>
                        <th scope='col'>Open Civic Data ID</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {referendums.map((referendum, idx) => (
                        <Fragment key={idx}>
                          <tr>
                            <td style={{ width: '10px' }}>{idx + 1}</td>
                            <td>{referendum.referendumTitle}</td>
                            <td>{referendum.district.name}</td>
                            {/* <td>
                      <Link href={`${referendum.referendumUrl}`}>
                      <a>{referendum.referendumUrl}</a>
                      </Link>
                    </td> */}
                          </tr>
                          <tr>
                            <td></td>
                            <td>{referendum.referendumSubtitle}</td>
                            <td>{referendum.district.scope}</td>
                            {/* </tr>
                          <tr>
                            <td></td>
                            <td style={{ wordWrap: 'anywhere' }}>
                              {referendum.district.id}
                            </td> */}
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

export default Referendums;
