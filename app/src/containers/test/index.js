import React, { Component } from 'react';

const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')

const ipfsOptions = {
  EXPERIMENTAL: {
    pubsub: true
  },
}

class Test extends Component {
  constructor(props) {
    super(props);
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
  }

  get() {
    alert('get');
  }

  set() {
 debugger
    const ipfs = new IPFS(ipfsOptions);
    const orbitdb = new OrbitDB(ipfs)
debugger
ipfs.on('error', (e) => {
  console.log(e);
  debugger
})
    ipfs.on('ready', async () => {
      // debugger

  const access = {
    // Give write access to ourselves
    write: [orbitdb.key.getPublic('hex')],
  }
debugger
      const db = await orbitdb.keyvalue('chaingear.abis', access)
      debugger
      console.log(db.address.toString())
        // .then(db => db.put('test', { name: 'hello' }))
        // .then(() => {
        //   debugger
        // })
    });
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
