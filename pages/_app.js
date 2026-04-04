import 'styles/globals.css';
import 'styles/fonts.css';
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
