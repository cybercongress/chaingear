import React, { Component } from 'react';

import {
    Content, ContainerRegister, SideBar,
    FieldsTable,
    Panel,
    Label,
    CreateButton,
    Control,
    PageTitle,
    RemoveButton,
    ErrorMessage,
    StatusBar,
    LinkHash,
    ActionLink,
} from '@cybercongress/ui';

import {
    getDefaultAccount,
    getRegistries,
    registerRegistry,
    getChaingearContract,
} from '../../utils/cyber';

import RegistrySource from '../../resources/Registry.sol';
import Code from '../../components/SolidityHighlight';

class NewRegister extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
            fields: [],
            contractName: '',
            contracts: [],
            beneficiaries: [],
            gasEstimate: null,
            registryAddress: null,
            error: null,

            inProgress: false,
            message: '',
            type: 'processing',
        };
    }

    componentWillMount() {
        getRegistries()
            .then(contracts => this.setState({ contracts }))
            .then(() => getDefaultAccount())
            .then(defaultAccount => this.setState({
                beneficiaries: [{
                    address: defaultAccount,
                    stake: 1,
                    share: 100,
                }],
            }));
    }

  add = (name, type) => {
      const newItem = {
          name,
          type,
      };

      this.setState({
          fields: this.state.fields.concat(newItem),
      });
  };

  remove = (name) => {
      this.setState({
          fields: this.state.fields.filter(x => x.name !== name),
      });
  };

  create = () => {
      const { contractName } = this.state;
      const symbol = this.refs.symbol.value;
      const version = this.refs.registryVersion.value;

      this.setState({ message: 'processing...', inProgress: true, type: 'processing' });
      getDefaultAccount().then((defaultAccount) => {
          return registerRegistry(contractName, symbol, version, [defaultAccount], [100]);
      })
          .then(({ txHash }) => {
              return getChaingearContract();
          })
          .then(({contract}) => {
              const event = contract.RegistryRegistered((ee, results) => {
                  event.stopWatching(() => {});
                  if (ee) {
                      throw new Error('Create registry event error');
                  } else {
                      this.setState({
                          inProgress: false,
                          registryAddress: results.args.registryAddress,
                      });
                  }
              });
          })
          .catch((error) => {
              console.log(`Cannot create registry ${contractName}. Error: ${error}`);
          });
  };

  closeMessage = () => {
      const { type, registryAddress } = this.state;

      this.setState({
          inProgress: false,
      });
      if (type === 'success') {
          if (registryAddress) {
              this.props.router.push(`/registers/${registryAddress}`);
          } else {
              this.props.router.push('/');
          }
      }
  };

  changeContractName = (e) => {
      this.setState({
          contractName: e.target.value,
      });

      this.refs.symbol.value = e.target.value;
  };

  render() {
      const {
          contractName, message, inProgress, contracts, type, beneficiaries, registryAddress,
      } = this.state;

      const exist = !!contracts.find(x => x.name === contractName);
      const benCount = beneficiaries.length;
      const canCreate = contractName.length > 0 && benCount > 0 && !exist;

      return (
          <div>
              <StatusBar
                open={ inProgress }
                message={ message }
                type={ type }
                onClose={ this.closeMessage }
              />

              <PageTitle>New registry creation</PageTitle>
              <ContainerRegister>
                  <SideBar>
                      <Label>Input</Label>
                      <Panel title='General Parameters'>
                          <Control title='Registry Name:'>
                              <input
                                  placeholder='name'
                                  value={ contractName }
                                onChange={ this.changeContractName }
                              />
                          </Control>
                          <Control title='Token Symbol:'>
                              <input
                                  ref='symbol'
                                  defaultValue=''
                                placeholder='symbol'
                              />
                          </Control>
                          <Control title='Version:'>
                              <select ref='registryVersion'>
                                  <option value='V1'>V1 (Basic Registry)</option>
                              </select>
                          </Control>
                      </Panel>

                      <Panel title='Beneficiaries (Optional)' noPadding>
                          <FieldsTable>

                              <thead>
                                  <tr>
                                      <th>Address</th>
                                      <th>Stake</th>
                                      <th>Share</th>
                                      <th />
                                  </tr>
                              </thead>

                              <tbody>
                                  {
                                      beneficiaries.map(ben => (
                                          <tr key={ ben.address }>
                                              <td style={{overflow: 'hidden'}}><LinkHash value={ ben.address } /></td>
                                              <td>{ ben.stake }</td>
                                              <td>{ ben.share }</td>
                                              <td>
                                                  <RemoveButton
                                                    onClick={ () => this.remove(ben.address) }
                                                  >
                                                      {'X'}
                                                  </RemoveButton>
                                              </td>
                                          </tr>
                                      ))
                                  }
                              </tbody>
                          </FieldsTable>
                          <CreateButton disabled={ !canCreate } onClick={ this.create }>
                                create
                          </CreateButton>
                      </Panel>
                  </SideBar>

                  <Content>
                      <Label color='#3fb990'>Registry source code</Label>
                      <Code>
                          {RegistrySource}
                      </Code>
                      {(type === 'error' && message) && <ErrorMessage>{message}</ErrorMessage>}
                      {registryAddress
                        && <span>
                            <ActionLink to={`/registers/${registryAddress}`}>Go to registry</ActionLink>
                            <ActionLink to={`/schema/${registryAddress}`}>Go to schema definition</ActionLink>
                        </span>
                      }
                  </Content>

              </ContainerRegister>
{/*              <Label>
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
              </Label>*/}
          </div>
      );
  }
}


export default NewRegister;
