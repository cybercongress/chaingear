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
              <Control title='Registry Name:'><input
                placeholder='name'
                value={contractName}
                onChange={this.changeContractName}
              /></Control>
              <Control title='Token Symbol:'><input
                ref='symbol'
                defaultValue=''
                placeholder='symbol'
              /></Control>

            </Panel>

            <Panel title='EntryCore Structure' noPadding={true}>
            <FieldsTable>
              <thead>
                <tr>
                  <th>Field</th>
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
        <Label>
            <div>Notes for Registry logic, creation, and deployment:</div>
            <div>0. With the form below you may code generate your EntryCore contract</div>
            <div>1. EntryCore consist from your data schema and CRUD operations</div>
            <div>2. With FIRST transaction you deploy Registry contract from Chaingear, your Registry is ERC721 CHG token</div>
            <div>3. With SECOND transaction you initialize Registry with EntryCore, each entry is the ERC721 token</div>
            <div>4. You EntryCore ABI saves in IPFS</div>
            <div>5. You are Registry/Entry owner == you are Chaingear/Registry token owner</div>
            <div>6. You may CREATE in Registry => mints token in Registry, initializes empty entry in EntryCore</div>
            <div>7. You may READ from EntryCore => pass tokenID and get entry</div>
            <div>8. You may UPDATE (if token owner) in EntryCore => pass tokenID and data to update</div>
            <div>9. You may DELETE (if token owner) in Registry => pass tokenID, burns token and clears entry in EntryCore</div>
            <div>10. You may TRANSFER/SELL (if token owner) in Registry => pass tokenID/new owner and asscociated entry goes to new owner</div>
            <div>11. You as admin may place fee entry-token creation</div>
            <div>12. You as admin may choose the policy for entry-token creation: [Admin, Whitelist, AllUsers]</div>
            <div>...</div>
            <div>42. You may TRANSFER/SELL (if token owner) Registry ownership => transfer/trade your CHG NFT token to the new owner!</div>
        </Label>
      </div>
    );
  }
}


export default NewRegister;
