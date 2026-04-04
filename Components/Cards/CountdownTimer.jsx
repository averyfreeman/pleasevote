import { useState, useEffect } from 'react';
import { timeRemaining } from 'lib/timerLogic';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';

const CountdownTimer = ({ endTime, label }) => {
  const [timeLeft, setTimeLeft] = useState(timeRemaining(endTime));
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(timeRemaining(endTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="mb-4 overflow-hidden border rounded-lg shadow-lg border-onehalf-gray bg-onehalf-dark">
      <button
        onClick={toggleOpen}
        className="flex items-center justify-between w-full px-6 py-4 text-left transition-colors bg-onehalf-blue text-onehalf-dark hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-onehalf-blue focus:ring-inset"
        aria-expanded={isOpen}
      >
        <span className="text-xl font-bold font-righteous">Countdown Timer</span>
        {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </button>

      {isOpen && (
        <div className="p-6 text-center bg-onehalf-dark">
          <h2 className="mb-4 text-2xl font-semibold text-onehalf-light">{label}</h2>
          <div className="inline-flex items-center justify-center px-8 py-4 mt-2 font-mono text-4xl border-4 rounded-lg bg-black/50 text-onehalf-red border-onehalf-gray shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
            <Clock className="mr-4" size={32} />
            <span className="tracking-widest">
              {timeLeft.remaining.days}d {timeLeft.remaining.hours}h {timeLeft.remaining.minutes}m {timeLeft.remaining.seconds}s
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountdownTimer;
