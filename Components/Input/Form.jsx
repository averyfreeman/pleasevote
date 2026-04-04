import { useState } from 'react';
import { useLocalStorage } from 'Components/Hooks/useLocalStorage';
import { useInput } from 'Components/Hooks/useInput';
import { CheckCircle, Info } from 'lucide-react';

const Form = (props) => {
  const [submitted, setSubmitted] = useState(null);
  const [variable, setVariable] = useLocalStorage(props.variable, null);
  const { value, bind, reset } = useInput('');

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(
      'Recording ' + props.variable + ' to window.localStorage: ' + value
    );
    setSubmitted(true);
    setVariable(value);
    reset();
    if (props.close) {
      props.close();
    }
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <div className="mb-2 text-lg font-medium text-onehalf-light">
            {props.label}:
          </div>
          <input
            type="text"
            className="w-full px-4 py-3 text-lg border rounded-lg outline-none bg-black/30 border-onehalf-gray text-onehalf-light placeholder-onehalf-gray focus:ring-2 focus:ring-onehalf-blue focus:border-transparent transition-all"
            value={value}
            placeholder={`Enter ${props.variable} here`}
            {...bind}
            required
          />
        </label>

        <button
          className="flex items-center justify-center w-full px-6 py-3 text-xl font-bold transition-all rounded-lg shadow-md bg-onehalf-green text-onehalf-dark hover:scale-105 active:scale-95 hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-onehalf-green"
          type="submit"
        >
          <CheckCircle className="mr-2" size={24} />
          Submit
        </button>
      </form>

      {props.showConfirmation && (
        <div className="flex items-start p-4 mt-6 space-x-3 rounded-lg bg-onehalf-red/10 border-l-4 border-onehalf-red">
          <Info className="flex-shrink-0 text-onehalf-red" size={20} />
          <p className="text-onehalf-light">
            <span className="font-bold text-onehalf-red">{props.label} submitted:</span>{' '}
            <span className="break-all italic">
              {variable || `no ${props.variable} submitted yet`}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Form;
