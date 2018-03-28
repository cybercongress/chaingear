import React, { Component } from 'react';

import { browserHistory } from 'react-router'

import generateContractCode from '../../generateContractCode';

import * as chaingear from '../../utils/chaingear';
import getWeb3 from '../../utils/getWeb3.js';

const IPFS = require('ipfs-api');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

const MAX_FIELD_COUNT = 10;

class AddField extends Component {
  state = {
    name: ''
  }
  add = () => {
    const {
      name
    } = this.state;
    const type = this.refs.type.value;
    this.props.onAdd(name, type);
    this.setState({
      name: ''
    })
  }
  changeName = (e) => {
    this.setState({ name: e.target.value })
  }

  render() {
    const {
      fields
    } = this.props;
    const {
      name
    } = this.state;
    const exist = !!fields.find(x => x.name === name);
    const canAdd = name.length > 0 && !exist;

    return (
      <tr >
          <td>
            <input value={name} onChange={this.changeName}/>
          </td>
          <td>
            <select ref='type'>
              <option value='string'>string</option>
              <option value='bool'>bool</option>
              <option value='int256'>int</option>
              <option value='uint256'>uint</option>
            </select>
          </td>
          <td>
            <button 
              style={{ fontSize: '70%' }} 
              className="pure-button"
              onClick={this.add}
              disabled={!canAdd}
            >add</button>                   
          </td>
        </tr>
    );
  }
}


class NewRegister extends Component {
    constructor(props) {
      super(props)

      this.state = {
        name: '',
          fields: [
          { name: 'name', type: 'string' }, 
          { name: 'ticker', type: 'string' }
        ],
        status: '',
        inProgress: false,
        contractName: 'Tokens',
        contracts: []
      }
    }


  
  componentDidMount() {    
    chaingear.getContracts()
      .then(contracts => this.setState({ contracts }))
  }
  add = (name, type) => {
    const newItem = {
      name,
      type
    };
    this.setState({
      fields: this.state.fields.concat(newItem)
    });
    }

    remove = (name) => {
      this.setState({
        fields: this.state.fields.filter(x => x.name !== name)
      })
    }

    create = () => {
      const { contractName, fields } = this.state;
      const code = generateContractCode(contractName, fields);

      this.setState({ status: 'load compiler...', inProgress : true })
      window.BrowserSolc.loadVersion("soljson-v0.4.6+commit.2dabbdf0.js", (compiler) => {
      const optimize = 1;
      this.setState({ status: 'compile...'})
      const compiledContract = compiler.compile('pragma solidity ^0.4.6; ' + code, optimize);

      this.setState({ status: 'estimate gas...'})
      getWeb3.then(({ web3 }) => {
      let abi = compiledContract.contracts[contractName].interface;
      let bytecode = '0x'+compiledContract.contracts[contractName].bytecode;
      web3.eth.estimateGas({data: bytecode}, (e, gasEstimate) => {
        let Contract = web3.eth.contract(JSON.parse(abi));

        this.setState({ status: 'deploy contract...'})

        Contract.new("sanchit", "s@a.com", {
           from: web3.eth.accounts[0],
           data:bytecode,
           gas: gasEstimate
         }, (err, myContract) => {
          console.log(' >> ', err, myContract);
          if (myContract.address) {
            this.setState({ status: 'save abi in ipfs...'})
            const buffer = Buffer.from(JSON.stringify(abi));
            ipfs.add(buffer, (err, ipfsHash) => {
              const hash = ipfsHash[0].path;
              this.setState({ status: 'register contract...'})
              chaingear.register(contractName, myContract.address, hash).then(() => {
                this.setState({ status: '', inProgress: false })
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
    const { contractName, fields, status, inProgress, contracts } = this.state;
    const code = generateContractCode(contractName, fields);
    const exist = !!contracts.find(x => x.name === contractName)
    const canDeploy = contractName.length > 0 && contractName.length > 0 && contractName.length <= MAX_FIELD_COUNT && !exist;
 
    return (
      <div>
        <div style={{
          position: 'fixed',
          background: 'rgba(0, 0, 0, 0.5)',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          display: inProgress ? 'flex' : 'none',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '50px',
          color: '#fff'
        }}>
        {status}
        </div>
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
              <AddField
                onAdd={this.add}
                fields={fields}
              />
              </tbody>
            </table>
            <button disabled={!canDeploy} onClick={this.create}>
              create contract
            </button>
          </div>
        </div>
      </div>
    );
  }
}


export default NewRegister;
