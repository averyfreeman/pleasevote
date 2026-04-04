import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useSWR from 'swr';
import Moment from 'react-moment';
import {
  AlertCircle,
  Info,
  HandPointer,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Loader2
} from 'lucide-react';

const ElectionInfo = () => {
  const [id, setId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    try {
      setId(JSON.parse(window.localStorage.getItem('id')));
    } catch (e) {
      setId(window.localStorage.getItem('id'));
    }
  }, []);

  const url = '/api/elections';
  const fetcher = (url) => fetch(url).then((r) => r.json());
  const { data, error } = useSWR(url, fetcher);

  if (error)
    return (
      <div className="flex items-center p-6 space-x-4 border-l-4 rounded-lg bg-onehalf-red/20 border-onehalf-red text-onehalf-red" role="alert">
        <AlertCircle size={32} />
        <span className="text-lg font-bold">Failed to load data</span>
      </div>
    );

  if (!data)
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="animate-spin text-onehalf-blue" size={64} />
        <p className="text-xl font-medium text-onehalf-gray">Loading elections...</p>
      </div>
    );

  if (
    (data && (data !== null) & !data.data.elections) ||
    data.data.elections.length <= 0 ||
    data.data.elections === null
  ) {
    return (
      <div className="border rounded-xl overflow-hidden border-onehalf-red shadow-lg bg-onehalf-dark">
        <div className="px-6 py-4 bg-onehalf-red text-white flex items-center">
          <AlertCircle className="mr-3" size={28} />
          <h3 className="text-xl font-bold">
            Attention: General elections not found in database
          </h3>
        </div>
        <div className="p-8 text-center space-y-6">
          <h5 className="text-lg text-onehalf-light">
            If you are aware of an upcoming election, please contact your
            state's election office to ask for more info
          </h5>
          <a
            href="https://www.usa.gov/election-office"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 text-lg font-bold transition-all rounded-lg bg-onehalf-yellow text-onehalf-dark hover:scale-105 active:scale-95"
          >
            <Info className="mr-3" size={24} />
            Click here to find your state election office
            <HelpCircle className="ml-3" size={24} />
          </a>
        </div>
      </div>
    );
  }

  if (data && data !== null) {
    const { elections } = data.data;

    const handleClick = (event, selectedId) => {
      event.preventDefault();
      console.log('Recording ' + selectedId + ' to window.localStorage');
      window.localStorage.removeItem('id');
      window.localStorage.setItem('id', JSON.stringify(selectedId));
      setId(selectedId);
      router.push('/voterinfo');
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3 text-lg text-onehalf-light bg-black/20 p-4 rounded-lg border border-onehalf-gray/30">
          <Info size={24} className="text-onehalf-cyan" />
          <p>
            Select an <span className="text-onehalf-blue font-bold uppercase underline">election id</span> below to view details for your area.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-onehalf-gray shadow-xl">
          <table className="w-full text-left border-collapse bg-onehalf-dark">
            <thead className="bg-onehalf-blue text-onehalf-dark font-righteous">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-onehalf-gray/30">
              {elections.map((election, idx) => (
                <tr key={election.id} className="hover:bg-onehalf-blue/10 transition-colors group">
                  <td className="px-6 py-4 text-onehalf-gray">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(event) => handleClick(event, election.id)}
                      className="text-onehalf-blue font-bold hover:underline flex items-center group-hover:scale-105 transition-transform"
                    >
                      {election.id}
                      <ChevronRight size={16} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </td>
                  <td className="px-6 py-4 font-medium text-onehalf-light">{election.name}</td>
                  <td className="px-6 py-4 text-onehalf-gray">
                    <Moment format='MM/DD/YYYY'>{election.electionDay}</Moment>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center p-4 space-x-3 rounded-lg bg-onehalf-red/10 border-l-4 border-onehalf-red">
          <Info className="flex-shrink-0 text-onehalf-red" size={20} />
          <p className="text-onehalf-light">
            <span className="font-bold text-onehalf-red">Election ID submitted:</span>{' '}
            <span className="italic">
              {id || `no id submitted yet`}
            </span>
          </p>
        </div>

        {elections.length < 50 && (
          <div className="p-6 text-center rounded-lg border border-onehalf-gray bg-black/10">
            <p className="text-lg text-onehalf-gray italic">
              If there is no election listed in your area, please check back later for updates.
            </p>
          </div>
        )}
      </div>
    );
  }
};

export default ElectionInfo;
