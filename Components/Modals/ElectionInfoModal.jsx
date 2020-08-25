import { Button, Modal } from 'react-bootstrap';
import ElectionInfo from 'Components/Dialogs/ElectionDialog';

const ElectionInfoModal = (props) => {
  return (
    <Modal {...props} size='lg' aria-labelledby='election-info-modal' centered>
      <Modal.Header closeButton>
        <Modal.Title id='election-info-modal'>
          Elections currently in database
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ElectionInfo />
      </Modal.Body>
      {/* <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer> */}
    </Modal>
  );
};

export default ElectionInfoModal;
