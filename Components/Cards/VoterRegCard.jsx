import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, ExternalLink } from 'lucide-react';

const VoterRegCard = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="mb-4 overflow-hidden border rounded-lg shadow-lg border-onehalf-gray bg-onehalf-dark">
      <button
        onClick={toggleOpen}
        className="flex items-center justify-between w-full px-6 py-4 text-left transition-colors bg-onehalf-blue text-onehalf-dark hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-onehalf-blue focus:ring-inset"
        aria-expanded={isOpen}
      >
        <span className="text-xl font-bold font-righteous">Are You Registered?</span>
        {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </button>

      {isOpen && (
        <div className="p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-6 md:flex-row md:space-y-0 md:space-x-8">
            <AlertTriangle className="text-onehalf-yellow" size={64} />

            <a
              href="https://vote.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 text-2xl font-bold transition-all rounded-lg shadow-md bg-onehalf-green text-onehalf-dark hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-onehalf-green"
            >
              Click Here to Register to Vote
              <ExternalLink className="ml-3" size={24} />
            </a>

            <AlertTriangle className="text-onehalf-yellow" size={64} />
          </div>
          <p className="mt-6 text-lg text-onehalf-gray italic">
            (Link to official vote.gov site)
          </p>
        </div>
      )}
    </div>
  );
};

export default VoterRegCard;
