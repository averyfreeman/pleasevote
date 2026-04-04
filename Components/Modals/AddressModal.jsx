import { X, MapPin, DoorOpen } from 'lucide-react';
import Form from 'Components/Input/Form';

const AddressModal = ({ show, onHide }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-onehalf-dark border border-onehalf-gray rounded-xl shadow-2xl overflow-hidden animate-zoom-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-onehalf-blue text-onehalf-dark">
          <h2 className="text-xl font-bold font-righteous">Please enter your address</h2>
          <button
            onClick={onHide}
            className="p-1 transition-colors bg-white/20 hover:bg-white/40 rounded-full focus:outline-none"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="text-center mb-8">
            <h3 className="flex items-center justify-center text-xl font-semibold text-onehalf-light">
              <MapPin className="mr-3 text-onehalf-red" size={28} />
              Required to retrieve information
              <DoorOpen className="ml-3 text-onehalf-green" size={28} />
            </h3>
          </div>

          <Form
            variable='address'
            label='Address'
            showConfirmation={true}
            close={onHide}
          />
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
