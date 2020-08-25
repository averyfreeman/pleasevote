import { useState } from 'react';
import { Card } from 'react-bootstrap';
import Form from 'Components/Input/Form';

const AddressDialog = (props) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleIsOpen = () => setIsOpen(!isOpen);

  return (
    <div>
      <Card className='mb-3 shadow'>
        {/* <Accordion.Toggle
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
        </Accordion.Toggle> */}
        <Card.Body>
          <h3 className='text-center mt-3'>
            <i className='fas fa-map-marked-alt'></i> Required to retrieve
            information <i className='fas fa-door-open'></i>
          </h3>

          <Form
            variable='address'
            label='Address'
            showConfirmation={true}
            close={props.close}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default AddressDialog;
