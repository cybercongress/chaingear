import React, { Component } from 'react';

import { browserHistory } from 'react-router'


import * as cyber from '../../utils/cyber';

const MAX_FIELD_COUNT = 10;

import AddField from './AddField';

import Code from '../../components/SolidityHighlight/';


import { 
    PageTitle,
    ContainerRegister,
    Content,
    SideBar,
    Label,
    CreateButton,
    Panel,
    FieldsTable,
    Control
} from '../../components/chaingear/'

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
      .then(({ items }) => this.setState({ contracts: items }));

    // this.setState({ status: 'load compiler...', inProgress : true });
    // cyber.loadCompiler((_compiler) => {
    //   compiler = _compiler;
    //   this.setState({ status: null, inProgress : false })
    // })
  }

  add = (name, type) => {
    const newItem = {
      name,
      type
    };
    this.setState({
      fields: this.state.fields.concat(newItem)
    });
    //, () => this.compileAndEstimateGas()
  }

  remove = (name) => {
    this.setState({
      fields: this.state.fields.filter(x => x.name !== name)
    })
    //, () => this.compileAndEstimateGas()
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
    const { contractName, fields } = this.state;
    const symbol = this.refs.symbol.value;

    this.setState({ status: 'processing...', inProgress: true });
    cyber.createRegistry(contractName, symbol, fields)
        .then(() => {
            this.setState({ status: null, inProgress: false });
            browserHistory.push(`/`);
        })
    // this.compileAndEstimateGas((web3) => {
    //   const { contractName, gasEstimate } = this.state;
    //   this.setState({ status: 'deploy contract...', inProgress: true });

    //   const opt = {
    //     gasEstimate,
    //     contractName,
    //     permissionType: +this.refs.permission.value,
    //     entryCreationFee: +this.refs.entryCreationFee.value,
    //     description: this.refs.description.value,
    //     tags: this.refs.tags.value
    //   };
    //   let address;
    //   cyber.deployRegistry(bytecode, abi, web3, opt)
    //     .then((_address) => {
    //       address = _address;
    //       this.setState({ status: 'save abi in ipfs...'});
    //       return cyber.saveInIPFS(abi);
    //     })
    //     .then(hash => {
    //       this.setState({ status: 'register contract...'});
    //       return cyber.register(contractName, address, hash);
    //     })
    //     .then(() => {
    //       this.setState({ status: '', inProgress: false });
    //       browserHistory.push(`/`);
    //     })
    //     .catch(err => {
    //       this.setState({
    //         error: err,
    //         inProgress: false
    //       })
    //     })
    // });
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

    console.log('>> ', inProgress, status)
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

        <PageTitle>New registry creation</PageTitle>
        <ContainerRegister>
          <SideBar>
            <Label>Input</Label>
            <Panel title='General Parameters'>
              <Control title='Name:'><input
                placeholder='name'
                value={contractName}
                onChange={this.changeContractName}
              /></Control>
                <Control title='symbol:'><input
                ref='symbol'
                defaultValue='TTT'
              /></Control>

            </Panel>

            <Panel title='Record Structure'>
            <FieldsTable>
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
            </FieldsTable>
            <CreateButton disabled={!canDeploy} onClick={this.create}>
              create registry
            </CreateButton>
            </Panel>
          </SideBar>

          <Content>
            <Label color="#3fb990">Output</Label>
            <Code>
                {code}
            </Code>
          </Content>

        </ContainerRegister>
      </div>
    );
  }
}


export default NewRegister;
