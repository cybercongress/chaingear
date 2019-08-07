import React, { Component } from 'react';

import {
    Content, ContainerRegister, SideBar,
    FieldsTable, PageTitle, RemoveButton,
    Message, StatusBar, WideSelect,
    Code, CircleLable, ProgressBar,
    Checkbox, TableRegistry, WideInput,
    AddButton, Panel, FlexContainer,
    FlexContainerLeft, FlexContainerRight,
    Button,
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

    render() {
        const {
            databaseName, fields, message, inProgress, type,
            isSchemaCreated, databaseSymbol, disableUniqueCheckbox,
        } = this.state;
        const code = generateContractCode(databaseName, fields);
        const fieldsCount = fields.length;
        const canCreateSchema = fieldsCount > 0
            && fieldsCount <= MAX_FIELD_COUNT && !isSchemaCreated;

        return (
            <div>
                <StatusBar
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
                </FlexContainer>
            </div>
        );
    }
}

export default SchemaDefinition;
