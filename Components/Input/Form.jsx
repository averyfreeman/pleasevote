import { useState } from 'react';
import { useLocalStorage } from 'Components/Hooks/useLocalStorage';
import { useInput } from 'Components/Hooks/useInput';
import styled from 'styled-components';

const Input = styled.input`
  width: 100%;
`;

const Form = (props) => {
  const [submitted, setSubmitted] = useState(null);
  const [variable, setVariable] = useLocalStorage(props.variable, null);
  const { value, bind, reset } = useInput('');

  const handleChange = (event) => {
    console.log(event.target.value);
  };

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
    <div className='p-2'>
      <form onSubmit={handleSubmit}>
        <label>
          <div className='mb-3'>{props.label}:</div>
          <div className='mb-3'>
            <Input
              type='text'
              size='80'
              wrap='hard'
              value={value}
              placeholder={`Enter ${props.variable} here`}
              {...bind}
            />
          </div>
        </label>
        <div className='mt-3'>
          <button className='btn btn-primary' type='submit'>
            Submit
          </button>
        </div>
      </form>
      {props.showConfirmation && (
        <p className='mt-3 text-danger'>
          {props.label} submitted:{' '}
          {variable || `no ${props.variable} submitted yet`}
        </p>
      )}
    </div>
  );
};

export default Form;
