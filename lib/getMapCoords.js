import Geocode from 'react-geocode';

export const coords = (props) => {
  const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  Geocode.setApiKey(MAPS_API_KEY);
  Geocode.setLanguage('en');
  return Geocode.fromAddress(props.value).then(
    (res, err) => {
      const { location } = res.results[0].geometry;
      console.log(location.lat, location.lng);
      return location;
    },
    (err) => {
      console.error(err);
    }
  );
};
