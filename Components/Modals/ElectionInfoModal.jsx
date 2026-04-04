import { X, Table } from 'lucide-react';
import ElectionInfo from 'Components/Dialogs/ElectionDialog';

const ElectionInfoModal = ({ show, onHide }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-onehalf-dark border border-onehalf-gray rounded-xl shadow-2xl overflow-hidden flex flex-col animate-zoom-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-onehalf-blue text-onehalf-dark shrink-0">
          <h2 className="text-xl font-bold font-righteous flex items-center">
            <Table className="mr-3" size={24} />
            Elections currently in database
          </h2>
          <button
            onClick={onHide}
            className="p-1 transition-colors bg-white/20 hover:bg-white/40 rounded-full focus:outline-none"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          <ElectionInfo />
        </div>
      </div>
    </div>
  );
};

export default ElectionInfoModal;
