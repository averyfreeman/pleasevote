import styled from 'styled-components';

export const Jumbotron = styled.div`
  background-color: green;
  box-shadow: inset 6px 6px 6px #444;
  border-top: 4px solid #33ab2c;
  border-right: 4px solid #00560a;
  border-left: 4px solid #33ab2c;
  border-bottom: 4px solid #00560a;
  border-radius: 4px;
  box-shadow: 4px 4px 8px black;
  font-family: 'Righteous', 'Gueda', sans-serif;
  overflow-wrap: anywhere;
  padding: 3rem;
  -webkit-text-stroke: 2px black;
  text-shadow: 2px 2px 4px black;

  h1 {
    font-size: 4.6rem;
  }

  h2 {
    font-size: 4rem;
  }

  h3 {
    font-size: 3rem;
  }

  h4 {
    font-size: 2.6rem;
  }

  h5 {
    font-size: 2rem;
  }
`;

export const ClockFace = styled.div`
  background-color: black;
  border-top: 5px solid #888;
  border-right: 5px solid #333;
  border-bottom: 5px solid #333;
  border-left: 5px solid #888;
  border-radius: 0;
  box-shadow: inset 4px 4px 8px #888;
  font-family: 'Digital Clock', 'vt323', 'Roboto', 'Consolata', monospace;
  font-size: 3rem;
  margin: 0 auto;
  padding: 0;
  vertical-align: baseline;
  width: 220px;
  @media (min-width: 600px) {
    font-size: 4rem;
    min-width: 520px;
  }
`;

export const OuterShadow = styled.div`
  box-shadow: 4px 4px 8px black;
  margin: 0:
  padding: 0;
`;
