import Link from 'next/link';
import { Info, ExternalLink, HelpCircle } from 'lucide-react';

const ServiceDisclaimer = () => {
  return (
    <div className="max-w-4xl mx-auto my-12 p-8 border-2 border-onehalf-gray rounded-xl bg-black/20 text-onehalf-light shadow-inner">
      <div className="flex flex-col space-y-6">
        <div className="flex items-start space-x-6">
          <Info className="flex-shrink-0 text-onehalf-cyan" size={48} />
          <div className="space-y-4 text-lg">
            <p>
              This information is provided from the{' '}
              <a
                href="https://www.votinginfoproject.org/about"
                target="_blank"
                rel="noopener noreferrer"
                className="text-onehalf-blue hover:underline inline-flex items-center"
              >
                Voting Information Project <ExternalLink size={16} className="ml-1" />
              </a>
              {' '}via the{' '}
              <a
                href="https://developers.google.com/civic-information"
                target="_blank"
                rel="noopener noreferrer"
                className="text-onehalf-blue hover:underline inline-flex items-center"
              >
                Google Civic API <ExternalLink size={16} className="ml-1" />
              </a>
            </p>

            <p>
              Read more about the{' '}
              <a
                href="https://docs.google.com/spreadsheets/d/1ZNcwc9U6dYNzVOQmheECnnZDtH6zxdwbkT9Ns8iOX9k/edit#gid=247788148"
                target="_blank"
                rel="noopener noreferrer"
                className="text-onehalf-blue hover:underline"
              >
                elections covered here
              </a>
              {' '}and a{' '}
              <a
                href="https://docs.google.com/document/d/1AFIDXn53AOEkdaGlvnpB3d73fn8EgGH_PSlWlm82bcA/pub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-onehalf-blue hover:underline inline-flex items-center"
              >
                FAQ about the info service <HelpCircle size={16} className="ml-1" />
              </a>
            </p>
          </div>
        </div>

        <div className="p-4 bg-onehalf-red/10 border-l-4 border-onehalf-red rounded-r-lg">
          <p className="text-onehalf-light">
            <span className="font-bold text-onehalf-red">Note:</span> While presumed accurate, site creator cannot be certain of
            validity of info provided by above sources. Check with your local
            election office if you have any questions:
          </p>
          <a
            href="https://www.usa.gov/election-office"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block font-bold text-onehalf-green uppercase tracking-wider hover:underline hover:text-onehalf-blue transition-colors"
          >
            Click here to find your state's election office
          </a>
        </div>
      </div>
    </div>
  );
};

export default ServiceDisclaimer;
