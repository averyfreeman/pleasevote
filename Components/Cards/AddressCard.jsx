import { useState } from 'react';
import { Accordion, Button, Card } from 'react-bootstrap';
import Form from 'Components/Input/Form';

const AddressCard = (props) => {
  const [isOpen, setIsOpen] = useState(true);

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
            <span className='text-left'>Address Form</span>
            <span className='float-right'>
              {isOpen && <i className='fas fa-times-circle'></i>}
              {!isOpen && <i className='fas fa-plus-circle'></i>}
            </span>
          </h3>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey='0'>
          <Card.Body>
            <h3 className='text-center mt-3'>
              <i className='fas fa-map-marked-alt'></i> Full address required
              for localized information <i className='fas fa-door-open'></i>
            </h3>

            <Form variable='address' label='Address' showConfirmation={true} />
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  );
};

export default AddressCard;
