import Link from 'next/link';

import { useState } from 'react';
import { Accordion, Button, Card } from 'react-bootstrap';

const StoredInfoCard = (props) => {
  const [isOpen, setIsOpen] = useState(true);
  const address = JSON.parse(window.localStorage.getItem('address'));
  const id = JSON.parse(window.localStorage.getItem('id'));

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
            <span className='text-left'>Currently Stored Info:</span>
            <span className='float-right'>
              {isOpen && <i className='fas fa-times-circle'></i>}
              {!isOpen && <i className='fas fa-plus-circle'></i>}
            </span>
          </h3>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey='0'>
          <Card.Body>
            <div>
              <i className='fas fa-info-circle fa-3x float-left'></i>
            </div>
            <div className='m-3 text-center blockquote'>
              <div className='blockquote'>
                If visiting the site again, your info may be saved from last
                visit
              </div>
              <div className='m-3 text-danger text-left'>
                Stored Address: {address || 'none currently stored'}
              </div>
              <div className='m-3 text-danger text-left'>
                Stored Election ID: {id || 'none currently stored'}
              </div>
              {/* <div className='m-3'>
                (Note: info stored on your device, not our server)
              </div> */}
              <div className='m-3'>Use the buttons below to update values</div>
            </div>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  );
};

export default StoredInfoCard;
