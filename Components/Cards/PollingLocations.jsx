import { Fragment, useState, useEffect } from 'react';
import useSWR from 'swr';
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Info,
  AlertCircle,
  ExternalLink,
  Loader2,
  CheckCircle
} from 'lucide-react';

const PollingLocations = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [params, setParams] = useState({ address: null, id: null });

  useEffect(() => {
    try {
      const address = JSON.parse(window.localStorage.getItem('address'));
      const id = JSON.parse(window.localStorage.getItem('id'));
      setParams({ address, id });
    } catch (e) {
      console.error("Error parsing stored data", e);
      const address = window.localStorage.getItem('address');
      const id = window.localStorage.getItem('id');
      setParams({ address, id });
    }
  }, []);

  const url = params.address && params.id ? `/api/voterInfo?id=${params.id}&address=${params.address}` : null;
  const fetcher = (url) => fetch(url).then((r) => r.json());
  const { data, error } = useSWR(url, fetcher);

  const toggleOpen = () => setIsOpen(!isOpen);

  if (!url) return null;

  if (error)
    return (
      <div className="flex items-center p-6 mb-4 space-x-4 border-l-4 rounded-lg bg-onehalf-red/20 border-onehalf-red text-onehalf-red" role="alert">
        <AlertCircle size={32} />
        <span className="text-lg font-bold">Failed to load polling locations!</span>
      </div>
    );

  if (!data)
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="animate-spin text-onehalf-blue" size={48} />
        <p className="text-onehalf-gray">Loading polling locations...</p>
      </div>
    );

  if (
    (data && (data !== null) & !data.data.pollingLocations) ||
    data.data.pollingLocations?.length <= 0 ||
    data.data.pollingLocations === null
  ) {
    return (
      <div className="mb-6 border rounded-xl overflow-hidden border-onehalf-red shadow-lg bg-onehalf-dark">
        <div className="px-6 py-4 bg-onehalf-red text-white flex items-center">
          <AlertCircle className="mr-3" size={28} />
          <h3 className="text-xl font-bold">Attention: Polling locations not found in database</h3>
        </div>
        <div className="p-8 text-center space-y-6">
          <p className="text-lg text-onehalf-light">
            Please contact your state's Secretary of State office to ask where your local polling location is located.
          </p>
          <a
            href="https://www.usa.gov/election-office"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 text-lg font-bold transition-all rounded-lg bg-onehalf-yellow text-onehalf-dark hover:scale-105"
          >
            <Info className="mr-3" size={24} />
            Search for your state election office
          </a>
        </div>
      </div>
    );
  }

  const { pollingLocations } = data.data;

  return (
    <div className="mb-6 overflow-hidden border rounded-lg shadow-lg border-onehalf-gray bg-onehalf-dark">
      <button
        onClick={toggleOpen}
        className="flex items-center justify-between w-full px-6 py-4 text-left transition-colors bg-onehalf-blue text-onehalf-dark hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-onehalf-blue focus:ring-inset"
        aria-expanded={isOpen}
      >
        <span className="text-xl font-bold font-righteous">Available Polling Location(s)</span>
        {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </button>

      {isOpen && (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {pollingLocations.map((location, idx) => (
            <div key={idx} className="flex flex-col border border-onehalf-gray/30 rounded-xl overflow-hidden bg-black/20">
              <div className="px-6 py-4 bg-onehalf-cyan/20 border-b border-onehalf-gray/30">
                <h3 className="text-xl font-bold font-righteous text-onehalf-cyan flex items-center">
                  <MapPin className="mr-2" size={20} />
                  {location.address.locationName}
                </h3>
              </div>

              <div className="p-6 flex-grow flex flex-col items-center justify-center text-center space-y-2">
                <p className="text-2xl font-bold text-onehalf-light">{location.address.line1}</p>
                {location.address.line2 && <p className="text-xl text-onehalf-light">{location.address.line2}</p>}
                <p className="text-lg text-onehalf-gray">
                  {location.address.city}, {location.address.state} {location.address.zip}
                </p>
              </div>

              <div className="p-4 bg-black/40 mt-auto border-t border-onehalf-gray/30">
                <div className="flex items-start space-x-3 mb-4">
                  <Clock className="text-onehalf-yellow flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-bold text-onehalf-yellow uppercase text-xs tracking-wider">Hours & Info</p>
                    <p className="text-onehalf-light">{location.pollingHours || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-onehalf-gray pt-2 border-t border-onehalf-gray/10">
                  <span>Source: {location.sources[0].name}</span>
                  {location.sources[0].official && (
                    <span className="flex items-center text-onehalf-green">
                      <CheckCircle size={12} className="mr-1" /> Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PollingLocations;
