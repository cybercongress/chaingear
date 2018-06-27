import React, { Component } from 'react';


import * as cyber from '../../utils/cyber';

const MAX_FIELD_COUNT = 10;

import AddField from './AddField';

import Code from '../../components/SolidityHighlight/';

import StatusBar from '../../components/StatusBar/';

import { 
    Content, ContainerRegister, SideBar,
    FieldsTable,
    Panel,
    Label,
    CreateButton,
    Control,
    PageTitle,
    RemoveButton,
} from '../../components/newregistry/'

let compiler;
let bytecode;

class NewRegister extends Component {
  constructor(props) {
    super(props)

    this.state = {
        name: '',
        fields: [
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

  compileAndEstimateGas = (cb) => {
    const { contractName, fields } = this.state;
    const code = cyber.generateContractCode(contractName, fields);

    this.setState({ status: 'compile...', inProgress: true });

    cyber.compileRegistry(code, contractName, compiler)
      .then((data) => {
        bytecode = data.bytecode;
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
            this.props.router.push('/')
        })    
  }

  changeContractName = (e) => {
    this.setState({
      contractName: e.target.value
    })
  }

  render() {
    const { contractName, fields, status, inProgress, contracts } = this.state;
    const code = cyber.generateContractCode(contractName, fields);
    const exist = !!contracts.find(x => x.name === contractName)
    const fieldsCount = fields.length;
    const canDeploy =  contractName.length > 0 && fieldsCount > 0 && fieldsCount <= MAX_FIELD_COUNT && !exist;

    return (
      <div>
        <StatusBar
          open={inProgress}
          message={status}
        />

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

            <Panel title='Record Structure' noPadding={true}>
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
                    <RemoveButton
                      onClick={() => this.remove(field.name)}
                    >remove</RemoveButton>
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
