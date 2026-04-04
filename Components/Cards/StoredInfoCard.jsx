import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

const StoredInfoCard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [storedData, setStoredData] = useState({ address: null, id: null });

  useEffect(() => {
    try {
      const address = JSON.parse(window.localStorage.getItem('address'));
      const id = JSON.parse(window.localStorage.getItem('id'));
      setStoredData({ address, id });
    } catch (e) {
      const address = window.localStorage.getItem('address');
      const id = window.localStorage.getItem('id');
      setStoredData({ address, id });
    }
  }, []);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="mb-4 overflow-hidden border rounded-lg shadow-lg border-onehalf-gray bg-onehalf-dark">
      <button
        onClick={toggleOpen}
        className="flex items-center justify-between w-full px-6 py-4 text-left transition-colors bg-onehalf-blue text-onehalf-dark hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-onehalf-blue focus:ring-inset"
        aria-expanded={isOpen}
      >
        <span className="text-xl font-bold font-righteous">Currently Stored Info:</span>
        {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </button>

      {isOpen && (
        <div className="p-6">
          <div className="flex items-start space-x-6">
            <Info className="flex-shrink-0 mt-1 text-onehalf-cyan" size={48} />
            <div className="flex-grow space-y-4">
              <p className="text-lg italic text-onehalf-light">
                If visiting the site again, your info may be saved from your last visit.
              </p>
              <div className="p-4 rounded bg-black/20 border-l-4 border-onehalf-red">
                <p className="font-semibold text-onehalf-red">
                  Stored Address: <span className="text-onehalf-light font-normal">{storedData.address || 'none currently stored'}</span>
                </p>
                <p className="font-semibold text-onehalf-red mt-2">
                  Stored Election ID: <span className="text-onehalf-light font-normal">{storedData.id || 'none currently stored'}</span>
                </p>
              </div>
              <p className="text-onehalf-gray">
                Use the buttons below to update values. Note: info is stored on your device, not our server.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoredInfoCard;
