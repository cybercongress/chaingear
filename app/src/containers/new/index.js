import React, { Component } from 'react';

// import guid from '../../utils/guid';
// import * as api from '../../utils/api';
import { browserHistory } from 'react-router'

// import axios from "axios";

import generateContractCode from '../../generateContractCode';

import * as chaingear from '../../utils/chaingear';
import getWeb3 from '../../utils/getWeb3.js';

// const IPFS = require('ipfs')
// const OrbitDB = require('orbit-db')

const IPFS = require('ipfs-api');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

// async function test() {
//  let t = axios.get('/test');
//  return t;
// }
const ipfsOptions = {
  EXPERIMENTAL: {
    pubsub: true
  },
}

// const saveAbi = (address, abi) => 
//   new Promise(resolve => {
    
//     const ipfs = new IPFS(ipfsOptions);
//     const orbitdb = new OrbitDB(ipfs)

//     ipfs.on('ready', () => {
//       orbitdb.keyvalue('chaingear.abis', { overwrite: true })
//         .then(db => db.put(address, abi))
//         .then(() => {
//           debugger
//           resolve();
//         })
//         // .catch(e => {
          
//         // })
//     //  // debugger
//     //  // ipfs.object.put(address, { enc: 'json' }, (err, node) => {
//     //  // debugger

//     //  // })
//     // //   debugger
//     //   const orbitdb = new OrbitDB(ipfs);
//     //   orbitdb.keyvalue('chaingear.abis')
//     //    .then(db => {
//     //      debugger
//     //      return db.set(address, abi);
//     //    })
//     //    .then(s => {
//     //      debugger
//     //      resolve();
//     //    });
//     })    
//   })


class NewRegister extends Component {
    constructor(props) {
      super(props)

      this.state = {
        name: '',
          fields: [
        { name: 'name', type: 'string' }, 
        { name: 'ticker', type: 'string' }
      ],
          contractName: 'Tokens'
      }
    }



  add = () => {
    const name = this.refs.name.value;
    const type = this.refs.type.value;
    const newItem = {
      name,
      type
    };
    this.setState({
      fields: this.state.fields.concat(newItem)
    });
    this.refs.name.value = '';
    }

    remove = (name) => {
      this.setState({
        fields: this.state.fields.filter(x => x.name !== name)
      })
    }

    create = () => {
      // const contractName = this.state.contractName;
      // const { fields } = this.state;

      // const txHash = guid();
      // const newItem = {
      //  name: contractName,
      //  fields,
      //  items: [],
      //  status: 'pending',
      //  txHash,
      //  fromAddress: '0x271FD5BBB0835DA3b295322096660f9b2Ea537C0'
      // };


      // axios.post('/api/compile', newItem)
      //  .then(response => {
      //    chaingear.register(contractName, response.data.address);
      //    browserHistory.push(`/`);
      //  })

    const { contractName, fields } = this.state;
    const code = generateContractCode(contractName, fields);

      window.BrowserSolc.loadVersion("soljson-v0.4.6+commit.2dabbdf0.js", function(compiler) {
      const optimize = 1;
      const compiledContract = compiler.compile('pragma solidity ^0.4.6; ' + code, optimize);
      console.log(compiledContract);

      getWeb3.then(({ web3 }) => {
      let abi = compiledContract.contracts[contractName].interface;
      let bytecode = '0x'+compiledContract.contracts[contractName].bytecode;
      web3.eth.estimateGas({data: bytecode}, function(e, gasEstimate) {
        let Contract = web3.eth.contract(JSON.parse(abi));

        Contract.new("sanchit", "s@a.com", {
           from: web3.eth.accounts[0],// fromAddress, //web3.eth.coinbase,
           data:bytecode,
           gas: gasEstimate
         }, function(err, myContract){
          console.log(' >> ', err, myContract);
          if (myContract.address) {
            // saveAbi(myContract.address, JSON.parse(abi))
            //   .then(x => {
                
            //     chaingear.register(contractName, myContract.address).then(() => {
            //       browserHistory.push(`/`);
            //     })
            //   })
            const buffer = Buffer.from(JSON.stringify(abi));
            ipfs.add(buffer, (err, ipfsHash) => {
              const hash = ipfsHash[0].path;
              debugger
              chaingear.register(contractName, myContract.address, hash).then(() => {
                browserHistory.push(`/`);
              });
            })
          }
         });
      });
              
      })

    });

    }

    changeContractName = (e) => {
      this.setState({
        contractName: e.target.value
      })
    }

  render() {
    const { contractName, fields } = this.state;
    const code = generateContractCode(contractName, fields);
    return (
      <div>
        <div className="pure-g">
          <div className="pure-u-1-2">
            <textarea rows="25" cols="60" value={code} onChange={()=>{}}>
            </textarea>
          </div>
          <div className="pure-u-1-2">
            <div>
              <input 
                placeholder='name'
                value={contractName}
                onChange={this.changeContractName}
              />
            </div>
            <table className="pure-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
              {fields.map(field => (
                <tr key={field.name}>
                  <td>{field.name}</td>
                  <td>{field.type}</td>
                  <td>
                    <button 
                      style={{ fontSize: '70%' }} 
                      className="pure-button"
                      onClick={() => this.remove(field.name)}
                    >remove</button>
                  </td>
                </tr>
              ))}
              <tr key='new-row'>
                <td>
                  <input ref='name'/>
                </td>
                <td>
                  <select ref='type'>
                    <option>string</option>
                    <option>uint</option>
                  </select>
                </td>
                <td>
                  <button 
                    style={{ fontSize: '70%' }} 
                    className="pure-button"
                    onClick={this.add}
                  >add</button>                   
                </td>
              </tr>
              </tbody>
            </table>
            <button onClick={this.create}>
              create contract
            </button>
          </div>
        </div>
      </div>
    );
  }
}


export default NewRegister;
