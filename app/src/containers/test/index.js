import React, { Component } from 'react';

// const IPFS = require('ipfs')
// const OrbitDB = require('orbit-db')

// const ipfsOptions = {
//   EXPERIMENTAL: {
//     pubsub: true
//   },
// }

const IPFS = require('ipfs-api');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });


class Test extends Component {
  constructor(props) {
    super(props);
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
  }

  get() {
    //alert('get');
    const hash = 'QmRoRQ9E6qqP8GKSuMZzFuimYqrk6d6S8uLVB3EtTGg4t7';
    ipfs.get(hash, function (err, files) {
      const buf = files[0].content;
      var temp = JSON.parse(buf.toString());
      debugger
    });
  }

  set() {
    const abi = {
      name: 'test'
    };
    const buffer = Buffer.from(JSON.stringify(abi));

    ipfs.add(buffer, (err, ipfsHash) => {
      debugger
    })
//  debugger
//     const ipfs = new IPFS(ipfsOptions);
//     const orbitdb = new OrbitDB(ipfs)
// debugger
// ipfs.on('error', (e) => {
//   console.log(e);
//   debugger
// })
//     ipfs.on('ready', async () => {
//       // debugger

//   const access = {
//     // Give write access to ourselves
//     write: [orbitdb.key.getPublic('hex')],
//   }
// debugger
//       const db = await orbitdb.keyvalue('chaingear.abis', access)
//       debugger
//       console.log(db.address.toString())
//         // .then(db => db.put('test', { name: 'hello' }))
//         // .then(() => {
//         //   debugger
//         // })
//     });
  }

  render() {
    return (
      <div>
        <div>
          <button onClick={this.get}>get</button>
          <button onClick={this.set}>set</button>
        </div>
      </div>
    );
  }
}

export default Test;
