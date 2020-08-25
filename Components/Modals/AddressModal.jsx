import { Button, Modal } from 'react-bootstrap';
import AddressDialog from 'Components/Dialogs/AddressDialog';

const AddressModal = (props) => {
  return (
    <Modal {...props} size='lg' aria-labelledby='address-modal' centered>
      <Modal.Header closeButton variant='primary'>
        <Modal.Title id='address-modal'>Please enter your address</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <AddressDialog close={props.onHide} />
      </Modal.Body>
    </Modal>
  );
};

export default AddressModal;
