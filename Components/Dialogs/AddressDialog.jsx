import { useState } from 'react';
import Form from 'Components/Input/Form';
import { MapPin, DoorOpen } from 'lucide-react';

const AddressDialog = (props) => {
  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center mb-8 space-y-4 text-center">
        <div className="flex items-center space-x-3 text-2xl font-bold text-onehalf-light font-righteous">
          <MapPin className="text-onehalf-red animate-bounce" size={32} />
          <span>Location Required</span>
          <DoorOpen className="text-onehalf-green" size={32} />
        </div>
        <p className="text-onehalf-gray max-w-md">
          To provide accurate election data, please enter your full residential address below.
        </p>
      </div>

      <Form
        variable='address'
        label='Address'
        showConfirmation={true}
        close={props.close}
      />
    </div>
  );
};

export default AddressDialog;
