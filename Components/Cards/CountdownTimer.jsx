import { useState, useEffect } from 'react';
import { ticker, timeRemaining } from 'lib/timerLogic';
import { Accordion, Button, Card } from 'react-bootstrap';
import { ClockFace, OuterShadow } from 'styles/styledComponents';

const CountdownTimer = ({ endTime, label }) => {
  const [timeLeft, setTimeLeft] = useState(timeRemaining(endTime));
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(timeRemaining(endTime));
    }, 1000);
  });

  const handleStartClock = () => {
    setTimeLeft(ticker);
  };

  const handleStopClock = () => {
    setTimeLeft(ticker);
  };

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
            <span className='text-left'>Countdown Timer &nbsp;</span>
            <span className='float-right'>
              {isOpen && <i className='fas fa-times-circle'></i>}
              {!isOpen && <i className='fas fa-plus-circle'></i>}
            </span>
          </h3>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey='0'>
          <Card.Body className='text-center'>
            <h1 className='display-1 '>
              {label}
              <ClockFace className='text-danger card card-body mt-3'>
                {timeLeft.remaining.days}d {timeLeft.remaining.hours}h{' '}
                {timeLeft.remaining.minutes}m {timeLeft.remaining.seconds}s
              </ClockFace>
            </h1>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  );
};

export default CountdownTimer;

{
  /* <button
  className='btn btn-outline-primary m-3'
  onClick={handleStartClock}
>
Start clock
</button>
<button
className='btn btn-outline-dark m-3'
onClick={handleStopClock}
>
Stop clock
</button> */
}
