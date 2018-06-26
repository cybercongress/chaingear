import * as React from "react";


const Robohash = ({ hash }) => (
  <img 
    style={{
      width: 140,
      height: 140,
      background: '#000',
      borderRadius: '50%'
    }}
    src={`https://robohash.org/${hash}`}
  />
);

export default Robohash;
