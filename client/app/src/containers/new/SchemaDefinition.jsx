import React, { Component } from 'react';

import {
    // Content, ContainerRegister, SideBar,
    // FieldsTable, PageTitle, RemoveButton,
    // Message, StatusBar, WideSelect,
    // Code, CircleLable, ProgressBar,
    // Checkbox, TableRegistry, WideInput,
    // AddButton, Panel, FlexContainer,
    // FlexContainerLeft, FlexContainerRight,
    // Button,
    Pane,
    Button,
    TableEv as Table,
    TextInput,
    Select,
    Tablist,
    Tab,
    IconButton,
    MainContainer,
    Code,
    Message,
    ScrollContainer,
    Section,
} from '@cybercongress/ui';

import {
    generateContractCode,
    deploySchema,
    getDatabaseContract,
    getChaingearContract,
    callContractMethod,
    mapDatabase,
    eventPromise,
} from '../../utils/cyber';

const MAX_FIELD_COUNT = 10;

const itemsTable = [
    {
        name: 'Address1',
        type: 'Address',
        validation: 'None',
    },
    {
        name: 'Address2',
        type: 'Uint256',
        validation: 'Unique',
    },
    {
        name: 'Address3',
        type: 'Uint256',
        validation: 'None',
    },
    {
        name: 'Address4',
        type: 'Bool',
        validation: 'Unique',
    },
    {
        name: 'Address5',
        type: 'Address',
        validation: 'None',
    },
    {
        name: 'Address6',
        type: 'String',
        validation: 'Unique',
    },
];

class SchemaDefinition extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fields: [],
            databaseName: '',
            databaseAddress: null,
            databaseSymbol: null,

            inProgress: false,
            message: '',
            type: 'processing',

            isSchemaCreated: false,

            disableUniqueCheckbox: false,

            tab: 'input',
        };
    }

    componentDidMount() {
        const { dbsymbol } = this.props.params;

        let chaingearContract;

        let databaseId;

        getChaingearContract()
            .then((contract) => {
                chaingearContract = contract;

                return callContractMethod(contract, 'getDatabaseIDBySymbol', dbsymbol);
            })
            .then((dbId) => {
                databaseId = dbId;

                return callContractMethod(chaingearContract, 'getDatabase', databaseId);
            })
            .then(database => mapDatabase(database, databaseId))
            .then(database => this.setState({
                databaseAddress: database.address,
                databaseName: database.name,
                databaseSymbol: dbsymbol,
            }));
    }

    add = () => {
        const { fields } = this.state;
        const name = this.fieldName.value;
        const type = this.fieldType.value;
        const unique = type === 'bool' ? false : this.fieldUnique.checked;

        const newItem = {
            name,
            type,
            unique,
        };

        this.fieldName.value = '';
        this.fieldUnique.checked = false;

        this.setState({
            fields: fields.concat(newItem),
        });
    };

    remove = (name) => {
        const { fields } = this.state;

        this.setState({
            fields: fields.filter(x => x.name !== name),
        });
    };

    createSchema = () => {
        const { databaseName, fields, databaseAddress } = this.state;

        this.setState({ message: 'processing...', inProgress: true, type: 'processing' });

        let databaseContract;

        getDatabaseContract(databaseAddress)
            .then((dbContract) => {
                databaseContract = dbContract;
                return deploySchema(databaseName, fields, databaseContract);
            })
            .then(() => eventPromise(databaseContract.DatabaseInitialized()))
            .then(() => {
                this.setState({
                    inProgress: false,
                    isSchemaCreated: true,
                });
            })
            .catch(() => this.setState({
                inProgress: false,
            }));
    };

    onFieldTypeChange = (event) => {
        if (event.target.value === 'bool') {
            this.setState({
                disableUniqueCheckbox: true,
            });
        } else {
            this.setState({
                disableUniqueCheckbox: false,
            });
        }
    };
    
    select = (tab) => {
        this.setState({ tab });
    };

    render() {
        const {
            databaseName,
            fields,
            message,
            inProgress,
            type,
            isSchemaCreated,
            databaseSymbol,
            disableUniqueCheckbox,
            tab,
        } = this.state;
        const code = generateContractCode(databaseName, fields);
        const fieldsCount = fields.length;
        const canCreateSchema = fieldsCount > 0 && fieldsCount <= MAX_FIELD_COUNT && !isSchemaCreated;

        let content;

        const FooterCyb = ({ disabled, databaseId }) => (
            <Pane
              display='flex'
              alignItems='center'
              justifyContent='center'
              width='100%'
              position='absolute'
              bottom={ 0 }
              paddingY={ 20 }
              backgroundColor='#000000'
              zIndex={ 2 }
            >
                <Pane
                  flexGrow={ 1 }
                  maxWidth={ 1000 }
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                  flexDirection='row'
                  paddingX='3vw'
                >
                    {databaseId ? (
                        <span>
                            <Button
                              className='btn'
                              marginX={ 10 }
                              height={ 42 }
                              minWidth={ 215 }
                              justifyContent='center'
                              to={ `/databases/${databaseId}` }
                            >
                                Go to database
                            </Button>
                            <Button marginX={ 10 } height={ 42 } minWidth={ 215 } className='btn' justifyContent='center' to={ `/schema/${databaseId}` }>
                                Go to schema definition
                            </Button>
                        </span>
                    ) : (
                        <Button paddingX={ 50 } height={ 42 } marginX={ 15 } className='btn' disabled={ disabled }>
                            Deploy schema
                        </Button>
                    )}
                </Pane>
            </Pane>
        );

        const tableRows = fields.reverse().map(field => (
            <Table.Row
              borderBottom='none'
            //   boxShadow='0px 0px 0.1px 0px #ddd'
              className='validators-table-row'
              paddingLeft='1rem'
              key={ field.name }
            >
                <Table.TextCell flexGrow={ 2 }>
                <span style={{ color: '#fff'}}>
                    {field.name}
                    </span>
                </Table.TextCell>
                <Table.TextCell><span style={{ color: '#fff'}}>{field.type}</span></Table.TextCell>
                <Table.TextCell><span style={{ color: '#fff'}}>{field.validation}</span></Table.TextCell>
                <Table.TextCell flex='none' width={ 60 }>
                    <IconButton icon='trash' appearance='minimal' className='icon-btn color-white-svg' />
                </Table.TextCell>
            </Table.Row>
        ));
        

        const TabInput = () => (
            <Section title='Schema structure'>
                <Table width='100%'>
                    <Table.Head
                      style={ { backgroundColor: '#000', borderBottom: '1px solid #ffffff80' } }
                      paddingLeft='1rem'
                    >
                        <Table.TextHeaderCell flexGrow={ 2 }>
                            <span style={ { color: '#fff' } }>Name</span>
                        </Table.TextHeaderCell>
                        <Table.TextHeaderCell>
                            <span style={ { color: '#fff' } }>Type</span>
                        </Table.TextHeaderCell>
                        <Table.TextHeaderCell>
                            <span style={ { color: '#fff' } }>Validation</span>
                        </Table.TextHeaderCell>
                        <Table.TextHeaderCell flex='none' width={ 60 } />
                    </Table.Head>
                    <Table.Body style={ { backgroundColor: '#000', overflowY: 'hidden' } }>
                        <Table.Row
                          paddingLeft='1rem'
                          style={ { border: 0 } }
                            //   boxShadow='0px 0px 0.1px 0px #ddd'
                        >
                            <Table.TextCell flexGrow={ 2 }>
                                <TextInput width='90%' className='input-green-no-focus' />
                            </Table.TextCell>
                            <Table.TextCell>
                                <Select width='70%' className='select-green'
                                  onChange={ this.onFieldTypeChange }
                                >
                                    <option value='string'>string</option>
                                    <option value='address'>address</option>
                                    <option value='bool'>bool</option>
                                    <option value='uint256'>uint256</option>
                                    <option value='int256'>int256</option>
                                </Select>
                            </Table.TextCell>
                            <Table.TextCell>
                                <Select width='50%' className='select-green'>
                                    <option value='Unique'>Unique</option>
                                    <option value='None'>None</option>
                                </Select>
                            </Table.TextCell>
                            <Table.TextCell flex='none' width={ 60 }>
                                <IconButton
                                  icon='add'
                                  appearance='minimal'
                                  className='icon-btn color-white-svg'
                                  onClick={ this.add }
                                />
                            </Table.TextCell>
                        </Table.Row>

                        <Pane>{tableRows}</Pane>
                    </Table.Body>
                </Table>
            </Section>
        );

        const TabOutput = () => (
            <Pane
              maxHeight={ 560 }
              height='60vh'
              paddingLeft='2rem'
              paddingRight='0.1rem'
              paddingY='1.5rem'
              borderRadius={ 4 }
              boxShadow='0px 0px 10px #36d6ae'
              marginBottom='2rem'
            >
                <Pane overflow='auto' height='100%'>
                    <Code>{code}</Code>
                </Pane>
            </Pane>
        );

        if (tab === 'input') {
            content = <TabInput />;
        }

        if (tab === 'output') {
            content = <TabOutput />;
        }
        return (
            <span>
                <ScrollContainer style={{height: '100vh'}}>
                    <MainContainer
                      style={ {
                            paddingTop: '2.5rem',
                            paddingBottom: '6rem',
                        } }
                    >
                        <Pane
                          display='flex'
                          flexDirection='column'
                          alignItems='center'
                          justifyContent='center'
                        >
                            <Tablist marginBottom={ 24 }>
                                <Tab
                                  key='Input'
                                  id='Input'
                                  isSelected={ tab === 'input' }
                                  onClick={ () => this.select('input') }
                                  paddingX={ 50 }
                                  paddingY={ 20 }
                                  marginX={ 3 }
                                  borderRadius={ 4 }
                                  color='#36d6ae'
                                  boxShadow='0px 0px 10px #36d6ae'
                                  fontSize='16px'
                                >
                                    Input
                                </Tab>
                                <Tab
                                  key='Output'
                                  id='Output'
                                  isSelected={ tab === 'output' }
                                  onClick={ () => this.select('output') }
                                  paddingX={ 50 }
                                  paddingY={ 20 }
                                  marginX={ 3 }
                                  borderRadius={ 4 }
                                  color='#36d6ae'
                                  boxShadow='0px 0px 10px #36d6ae'
                                  fontSize='16px'
                                >
                                    Output
                                </Tab>
                            </Tablist>
                        </Pane>

                        {content}

                        {message && (
                            <Message
                              style={ { position: 'sticky', bottom: '10%', maxWidth: '100%' } }
                              type='error'
                            >
                                {message}
                            </Message>
                        )}
                    </MainContainer>
                </ScrollContainer>
                <FooterCyb />
                
                {/* <StatusBar
                  open={ inProgress }
                  message={ message }
                  type={ type }
                />

                <PageTitle>Database schema definition</PageTitle>

                <ProgressBar>
                    <CircleLable type='complete' number='1' text='Database initialization' />
                    <CircleLable type={ isSchemaCreated ? 'complete' : 'edit' } number='2' text='Schema definition' />
                </ProgressBar>

                <ContainerRegister>
                    <SideBar title='Input'>
                        <Panel title='Record Structure' style={ { minHeight: '403px' } } noPadding>
                            <FieldsTable>
                                <TableRegistry>
                                    <tbody>
                                        {fields.map(field => (
                                            <tr key={ field.name }>
                                                <td>{field.name}</td>
                                                <td>{field.type}</td>
                                                <td>
                                                    <Checkbox
                                                      disabled
                                                      checked={ field.unique }
                                                    >
                                                        unique
                                                    </Checkbox>
                                                </td>
                                                {!isSchemaCreated && (
                                                    <td>
                                                        <RemoveButton
                                                          onClick={
                                                              () => this.remove(field.name)
                                                          }
                                                        />
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </TableRegistry>

                                {!isSchemaCreated
                                    && (
                                    <TableRegistry>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <WideInput
                                                      inputRef={ (node) => {
                                                          this.fieldName = node;
                                                      } }
                                                      placeholder='Name'
                                                    />
                                                </td>
                                                <td>
                                                    <WideSelect
                                                      inputRef={ (node) => {
                                                          this.fieldType = node;
                                                      } }
                                                      onChange={ this.onFieldTypeChange }
                                                    >
                                                        <option value='string'>string</option>
                                                        <option value='address'>address</option>
                                                        <option value='bool'>bool</option>
                                                        <option value='uint256'>uint256</option>
                                                        <option value='int256'>int256</option>
                                                    </WideSelect>
                                                </td>
                                                <td hidden={ disableUniqueCheckbox }>
                                                    <Checkbox
                                                      inputRef={ (node) => {
                                                            this.fieldUnique = node;
                                                      } }
                                                    >
                                                        unique
                                                    </Checkbox>
                                                </td>
                                                <td>
                                                    <AddButton
                                                      onClick={ this.add }
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </TableRegistry>
                                    )
                                }
                            </FieldsTable>
                        </Panel>
                    </SideBar>

                    <Content title='Database code'>
                        <Code>
                            {code}
                        </Code>
                    </Content>
                </ContainerRegister>

                <FlexContainer>
                    <FlexContainerLeft>
                        {(type === 'error' && message) && <Message type='error'>{message}</Message>}
                    </FlexContainerLeft>
                    <FlexContainerRight>
                        {isSchemaCreated ? (
                            <Button
                              color='blue'
                              to={ `/databases/${databaseSymbol}` }
                            >
                                Go to database
                            </Button>
                        ) : (
                            <Button
                              color='blue'
                              disabled={ !canCreateSchema }
                              onClick={ this.createSchema }
                            >
                                Define schema
                            </Button>
                        )}
                    </FlexContainerRight>
                </FlexContainer> */}
            </span>
        );
    }
}

export default SchemaDefinition;
