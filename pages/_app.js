import 'bootstrap/dist/css/bootstrap.min.css';
import 'styles/fonts.css';
import 'styles/modal-header-primary.css';
import 'styles/narrow-modal-width.css';
import NoSsr from 'Components/Util/NoSsr';

function App({ Component, pageProps }) {
  return (
    <>
      <NoSsr>
        <Component {...pageProps} />
      </NoSsr>
    </>
  );
}

export default App;
