import Link from 'next/link';

const ServiceDisclaimer = (props) => {
  return (
    <div className='card font-monospace text-center text-light bg-dark mt-3 mb-5'>
      <div>
        <i className='fas fa-info-circle fa-3x float-left'></i>
      </div>
      <p className='m-3 blockquote'>
        This information is provided from the{' '}
        <Link href='https://www.votinginfoproject.org/about'>
          <a target='_blank'>Voting Information Project</a>
        </Link>{' '}
        via the{' '}
        <Link href='https://developers.google.com/civic-information'>
          <a target='_blank'>Google Civic API</a>
        </Link>
      </p>

      <p className='m-3 blockquote'>
        Read more about the{' '}
        <Link href='https://docs.google.com/spreadsheets/d/1ZNcwc9U6dYNzVOQmheECnnZDtH6zxdwbkT9Ns8iOX9k/edit#gid=247788148'>
          <a target='_blank'>
            elections that have been and will be covered here
          </a>
        </Link>{' '}
        and a{' '}
        <Link href='https://docs.google.com/document/d/1AFIDXn53AOEkdaGlvnpB3d73fn8EgGH_PSlWlm82bcA/pub'>
          <a target='_blank'>FAQ about the info service here</a>
        </Link>
      </p>
      <p className='m-3'>
        Note: While presumed accurate, site creator cannot be certain of
        validity of info provided by above sources. Check with your local
        election office if you have any questions:
        {/* </p>
      <p className=''> */}
        <Link href='https://www.usa.gov/election-office'>
          <a
            className='m-3 font-weight-bold'
            style={{ textTransform: 'uppercase' }}
            target='_blank'
          >
            {/* <div className='text-center'> */}
            Click here to find your state's election office
          </a>
        </Link>
      </p>
      <div>
        <i className='fas fa-info-circle fa-3x float-right'></i>
      </div>
    </div>
  );
};

export default ServiceDisclaimer;
