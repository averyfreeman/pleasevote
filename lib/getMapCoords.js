// import { useState } from 'react';
import Geocode from 'react-geocode';
import { apiKey } from 'mapsKey';

export const coords = (props) => {
  // const [coords, setCoords] = useState(null);
  // console.log(props.value);
  // Geocode.enableDebug();

  Geocode.setApiKey(apiKey);
  Geocode.setLanguage('en');
  // setCoords(
  return Geocode.fromAddress(props.value).then(
    (res, err) => {
      const { location } = res.results[0].geometry;
      console.log(location.lat, location.lng);
      // coords = location;
      // console.log(coords);
      return location;
    },
    (err) => {
      console.error(err);
    }
    // )
  );
};
