import React, { Component } from 'react';

import { browserHistory } from 'react-router'

import generateContractCode from '../../generateContractCode';

import * as cyber from '../../utils/cyber';

const ChaingeareableSource = require('../../Chaingeareable.sol');

const MAX_FIELD_COUNT = 10;

import AddField from './AddField';

let compiler;
let compiledContract;
let bytecode;
let abi;

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
      contracts: [],
      gasEstimate: null,
      error: null
    }
  }


  
  componentDidMount() {    
    cyber.getContracts()
      .then(contracts => this.setState({ contracts }));

    this.setState({ status: 'load compiler...', inProgress : true });
    setTimeout(() => {
      window.BrowserSolc.loadVersion("soljson-v0.4.18+commit.9cf6e910.js", (_compiler) => {
        compiler = _compiler;
        this.setState({ status: null, inProgress : false })
        this.compileAndEstimateGas();
      });
    }, 30);

  }

  add = (name, type) => {
    const newItem = {
      name,
      type
    };
    this.setState({
      fields: this.state.fields.concat(newItem)
    }, () => this.compileAndEstimateGas());
  }

  remove = (name) => {
    this.setState({
      fields: this.state.fields.filter(x => x.name !== name)
    }, () => this.compileAndEstimateGas())
  }

  compileAndEstimateGas = (cb) => {
    const { contractName, fields } = this.state;
    const code = generateContractCode(contractName, fields);

    this.setState({ status: 'compile...', inProgress: true });

    const input = {
      'Chaingeareable.sol': ChaingeareableSource,
      [contractName]: 'pragma solidity ^0.4.18; ' + code,
    };

    setTimeout(() => {
      compiledContract = compiler.compile({sources : input }, 1);
      if (compiledContract.errors && compiledContract.errors.length > 0) {
        this.setState({
          inProgress: false,
          error: compiledContract.errors[0]
        })
        return;
      }
      abi = compiledContract.contracts[contractName +":"+ contractName].interface;
      bytecode = '0x'+compiledContract.contracts[contractName +":"+ contractName].bytecode;

      this.setState({ status: 'estimate gas...'});
      cyber.getWeb3.then(({ web3 }) => {
        web3.eth.estimateGas({data: bytecode}, (e, gasEstimate) => {
          this.setState({
            gasEstimate: gasEstimate + 1000000,
            inProgress: false
          }, () => {
            if (cb) cb();            
          });
        })
      });
    }, 20);
  }

  create = () => {
    
    this.compileAndEstimateGas(() => {
      const { contractName, gasEstimate } = this.state;
      this.setState({ status: 'deploy contract...', inProgress: true });
      let Contract = web3.eth.contract(JSON.parse(abi));
      var _benefitiaries = ['0xa3564D084fabf13e69eca6F2949D3328BF6468Ef']; // ???
      var _shares = [100];// ???
      var _permissionType = +this.refs.permission.value;
      var _entryCreationFee = web3.toWei(+this.refs.entryCreationFee.value, 'ether');// ???
      var _name = contractName;
      var _description = this.refs.description.value;
      var _tags = this.refs.tags.value;

      Contract.new(
        _benefitiaries,
        _shares,
        _permissionType,
        _entryCreationFee,
        _name,
        _description,
        _tags,
       {
         from: web3.eth.accounts[0],
         data:bytecode,
         gas: gasEstimate
       }, (err, myContract) => {
        console.log(' >> ', err, myContract);
        if (err) {
          this.setState({
            error: err,
            inProgress: false
          })
        } else {
          if (myContract.address) {
            this.setState({ status: 'save abi in ipfs...'})
            const buffer = Buffer.from(JSON.stringify(abi));
            cyber.ipfs.add(buffer, (err, ipfsHash) => {
              const hash = ipfsHash[0].path;
              this.setState({ status: 'register contract...'})
              cyber.register(contractName, myContract.address, hash).then(() => {
                this.setState({ status: '', inProgress: false })
                browserHistory.push(`/`);
              });
            })
          }          
        }
       });

    });
  }

  changeContractName = (e) => {
    this.setState({
      contractName: e.target.value
    })
  }

  render() {
    const { contractName, fields, status, inProgress, contracts, gasEstimate, error } = this.state;
    const code = generateContractCode(contractName, fields);
    const exist = !!contracts.find(x => x.name === contractName)
    const fieldsCount = fields.length;
    const canDeploy = contractName.length > 0 && fieldsCount > 0 && fieldsCount <= MAX_FIELD_COUNT && !exist;
 
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
              <p>Name:<input 
                placeholder='name'
                value={contractName}
                onChange={this.changeContractName}
              /></p>
              <p>entry Creation Fee:<input 
                ref='entryCreationFee'
                defaultValue='0.1'
              /></p>


              <p>Description:<input 
                placeholder='description'
                ref='description'
              /></p>
              <p>Permission:
                <select ref='permission'>
                  <option value='1'>OnlyOwner</option>
                  <option value='2'>AllUsers</option>
                  <option value='3'>Whitelist</option>
                </select>
              </p>

              <p>Tags:<input 
                placeholder='tags'
                ref='tags'
              /></p>
            </div>
            {error ? (
              <div>
                {error}
              </div>
            ) : <div>
              gas Estimate: {gasEstimate} gwei
            </div>}
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
