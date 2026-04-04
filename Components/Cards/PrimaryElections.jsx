import { Fragment, useState, useEffect } from 'react';
import useSWR from 'swr';
import {
  ChevronDown,
  ChevronUp,
  User,
  MapPin,
  Globe,
  AlertCircle,
  Info,
  Loader2
} from 'lucide-react';

const PrimaryElections = () => {
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
        <span className="text-lg font-bold">Failed to load primary election data!</span>
      </div>
    );

  if (!data)
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="animate-spin text-onehalf-blue" size={48} />
        <p className="text-onehalf-gray">Loading primary elections...</p>
      </div>
    );

  const contests = data.data.contests || [];
  const primaryElections = contests.filter(contest => contest.type === 'Primary');

  if (primaryElections.length === 0) {
    return (
      <div className="mb-6 border rounded-xl overflow-hidden border-onehalf-green shadow-lg bg-onehalf-dark">
        <div className="px-6 py-4 bg-onehalf-green text-onehalf-dark flex items-center">
          <Info className="mr-3" size={28} />
          <h3 className="text-xl font-bold">Primary elections not found in database</h3>
        </div>
        <div className="p-8 text-center space-y-4">
          <p className="text-lg text-onehalf-light">
            If you are aware of an upcoming primary, please contact your state's election office.
          </p>
          <a
            href="https://www.usa.gov/election-office"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-2 font-bold text-onehalf-blue hover:underline"
          >
            Find your state election office <Globe className="ml-2" size={20} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 overflow-hidden border rounded-lg shadow-lg border-onehalf-gray bg-onehalf-dark">
      <button
        onClick={toggleOpen}
        className="flex items-center justify-between w-full px-6 py-4 text-left transition-colors bg-onehalf-blue text-onehalf-dark hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-onehalf-blue focus:ring-inset"
        aria-expanded={isOpen}
      >
        <span className="text-xl font-bold font-righteous">Upcoming Primary Election(s)</span>
        {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </button>

      {isOpen && (
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-onehalf-blue/10 text-onehalf-blue uppercase text-sm font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 border-b border-onehalf-gray/20">Office / Candidates</th>
                <th className="px-6 py-4 border-b border-onehalf-gray/20">District / Scope</th>
                <th className="px-6 py-4 border-b border-onehalf-gray/20">Party / Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-onehalf-gray/10">
              {primaryElections.map((election, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-6">
                    <div className="font-bold text-xl text-onehalf-light mb-4">{election.office}</div>
                    <div className="space-y-2">
                      {election.candidates?.map((candidate, cIdx) => (
                        <div key={cIdx} className="flex items-center text-onehalf-cyan">
                          <User size={16} className="mr-2 opacity-70" />
                          <span>{candidate.name}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-start space-x-2 text-onehalf-light mb-2">
                      <MapPin size={18} className="text-onehalf-red shrink-0 mt-1" />
                      <span>{election.district.name}</span>
                    </div>
                    <div className="inline-block px-3 py-1 rounded-full bg-onehalf-magenta/20 text-onehalf-magenta text-xs font-bold uppercase">
                      {election.district.scope}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="space-y-2 mb-4">
                      {election.candidates?.map((candidate, cIdx) => (
                        <div key={cIdx} className="text-onehalf-gray h-6 flex items-center">
                          {candidate.party || 'No party listed'}
                        </div>
                      ))}
                    </div>
                    <div className="text-onehalf-yellow font-medium">
                      {election.level?.join(', ')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4 bg-black/20 text-onehalf-gray text-sm italic">
            List of primary election contests in your area
          </div>
        </div>
      )}
    </div>
  );
};

export default PrimaryElections;
