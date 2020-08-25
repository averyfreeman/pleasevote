import Link from 'next/link';

import { useState } from 'react';
import { Accordion, Button, Card } from 'react-bootstrap';

const VoterRegCard = (props) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleIsOpen = () => setIsOpen(!isOpen);

  return (
    <Accordion defaultActiveKey='0' onClick={handleIsOpen}>
      <Card className='mb-3 shadow'>
        <Accordion.Toggle
          as={Card.Header}
          color='Primary'
          eventKey='0'
          style={{ cursor: 'pointer' }}
        >
          <h3 className='card-header bg-primary text-white'>
            <span className='text-left'>Are You Registered?</span>
            <span className='float-right'>
              {isOpen && <i className='fas fa-times-circle'></i>}
              {!isOpen && <i className='fas fa-plus-circle'></i>}
            </span>
          </h3>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey='0'>
          <Card.Body className='text-center'>
            <div>
              <h1 className='display-1 mt-3'>
                <span className='float-left'>
                  <i className='fas fa-exclamation-triangle text-danger 3 mb-3'></i>
                </span>
                <Button size='lg' className='font-weight-bold mb-3 shadow'>
                  <Link href='https://vote.gov'>
                    <a
                      className='text-white'
                      style={{ textDecoration: 'none' }}
                      target='_blank'
                    >
                      Click Here to Register to Vote
                    </a>
                  </Link>
                </Button>
                <span className='float-right'>
                  <i className='fas fa-exclamation-triangle text-danger 3 mb-3'></i>
                </span>
              </h1>
              <h5 className='text-center'>(Link to official vote.gov site)</h5>
            </div>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  );
};

export default VoterRegCard;
