import * as React from "react";


const Robohash = ({ hash, style }) => (
  <img 
    style={{
      width: 140,
      height: 140,
      background: '#000',
      borderRadius: '50%',
      ...style
    }}

    src={`https://robohash.org/${hash}`}
  />
);

export default Robohash;
