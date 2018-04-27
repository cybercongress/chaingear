import React, { Component } from 'react';

import { browserHistory } from 'react-router'


import * as cyber from '../../utils/cyber';

const MAX_FIELD_COUNT = 10;

import AddField from './AddField';

let compiler;
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
    cyber.getRegistry()
      .then(contracts => this.setState({ contracts }));

    this.setState({ status: 'load compiler...', inProgress : true });
    cyber.loadCompiler((_compiler) => {
      compiler = _compiler;
      this.setState({ status: null, inProgress : false })

    })
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
    const code = cyber.generateContractCode(contractName, fields);

    this.setState({ status: 'compile...', inProgress: true });

    cyber.compileRegistry(code, contractName, compiler)
      .then((data) => {
        bytecode = data.bytecode;
        abi = data.abi;
        this.setState({ status: 'estimate gas...'});
        return data;
      })
      .then(() => cyber.estimateNewRegistryGas(bytecode))
      .then(({ web3, gasEstimate }) => {
        this.setState({
          gasEstimate: gasEstimate + 1000000,//bug with web3, incorrect estimate
          inProgress: false,
          error: null
        }, () => {
          if (cb) cb(web3);  
        })
      })
      .catch(error => {
        this.setState({
          inProgress: false,
          error
        })
      })
  }

  create = () => {
    debugger
    this.compileAndEstimateGas((web3) => {
      const { contractName, gasEstimate } = this.state;
      this.setState({ status: 'deploy contract...', inProgress: true });

      const opt = {
        gasEstimate,
        contractName,
        permissionType: +this.refs.permission.value,
        entryCreationFee: +this.refs.entryCreationFee.value,
        description: this.refs.description.value,
        tags: this.refs.tags.value
      };
      let address;
      cyber.deployRegistry(bytecode, abi, web3, opt)
        .then((_address) => {
          address = _address;
          this.setState({ status: 'save abi in ipfs...'});
          return cyber.saveInIPFS(abi);
        })
        .then(hash => {
          this.setState({ status: 'register contract...'});
          return cyber.register(contractName, address, hash);
        })
        .then(() => {
          this.setState({ status: '', inProgress: false });
          browserHistory.push(`/`);
        })
        .catch(err => {
          this.setState({
            error: err,
            inProgress: false
          })
        })
    });
  }

  changeContractName = (e) => {
    this.setState({
      contractName: e.target.value
    })
  }

  render() {
    const { contractName, fields, status, inProgress, contracts, gasEstimate, error } = this.state;
    const code = cyber.generateContractCode(contractName, fields);
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
            <button onClick={() => this.compileAndEstimateGas()}>estimate</button>
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
