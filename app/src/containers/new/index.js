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
    ErrorMessage
} from '../../components/newregistry/'


class NewRegister extends Component {
  constructor(props) {
    super(props)

    this.state = {
        name: '',
        fields: [
        ],
        contractName: '',
        contracts: [],
        gasEstimate: null,
        registryAddress: null,
        error: null,

        inProgress: false,
        message: '',
        type: 'processing',

        // message: 'Build failed. Please, make sure your entered names don’t start with a digit and they aren’t reserved words.',
        // inProgress: true,
        // type: 'error',

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


  create = () => {
    const { contractName, fields } = this.state;
    const symbol = this.refs.symbol.value;

    this.setState({ message: 'processing...', inProgress: true, type: 'processing' });
    cyber.createRegistry(contractName, symbol, fields)
        .then(({ registryAddress }) => {
            this.setState({ message: 'build successful', type: 'success', registryAddress });
            
        })
        .catch(e => {
            this.setState({ message: 'Build failed. Please, make sure your entered names don’t start with a digit and they aren’t reserved words.', type: 'error' });
        })    
  }

  closeMessage = () => {
    const { type, registryAddress } = this.state;
    this.setState({
        inProgress: false
    })
    if (type === 'success') {
        if (registryAddress) {
            this.props.router.push('/registers/' + registryAddress);
        } else {
            this.props.router.push('/');
        }
    } 
  }

  changeContractName = (e) => {
    this.setState({
      contractName: e.target.value
    })

    this.refs.symbol.value = e.target.value
  }

  render() {
    const { contractName, fields, message, inProgress, contracts, type } = this.state;
    const code = cyber.generateContractCode(contractName, fields);
    const exist = !!contracts.find(x => x.name === contractName)
    const fieldsCount = fields.length;
    const canDeploy =  contractName.length > 0 && fieldsCount > 0 && fieldsCount <= MAX_FIELD_COUNT && !exist;

    return (
      <div>
        <StatusBar
          open={inProgress}
          message={message}
          type={type}
          onClose={this.closeMessage}
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
                defaultValue=''
                placeholder='symbol'
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
            {(type === 'error' && message) && <ErrorMessage>{message}</ErrorMessage>}
          </Content>

        </ContainerRegister>
      </div>
    );
  }
}


export default NewRegister;
