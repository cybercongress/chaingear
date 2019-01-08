import React, { Component } from 'react';

import {
    Content, ContainerRegister, SideBar,
    FieldsTable,
    Panel,
    Label,
    CreateButton,
    PageTitle,
    RemoveButton,
    ErrorMessage,
    AddField,
    StatusBar,
    ActionLink,
    RightContainer,
    WideSelect,
    Code, DarkPanel,
    CircleLable, ProgressBar, Checkbox, TableRegistry, WideInput, AddButton,
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
        const dbsymbol = this.props.params.dbsymbol;
        let _chaingearContract;
        let _databaseId;

        getChaingearContract()
            .then((contract) => {
                _chaingearContract = contract;

                return callContractMethod(contract, 'getDatabaseIDBySymbol', dbsymbol);
            })
            .then((databaseId) => {
                _databaseId = databaseId;

                return callContractMethod(_chaingearContract, 'getDatabase', databaseId);
            })
            .then(database => mapDatabase(database, _databaseId))
            .then(database => this.setState({
                databaseAddress: database.address,
                databaseName: database.name,
                databaseSymbol: dbsymbol,
            }));
    }

    add = () => {
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
            fields: this.state.fields.concat(newItem),
        });
    };

    remove = (name) => {
        this.setState({
            fields: this.state.fields.filter(x => x.name !== name),
        });
    };

    createSchema = () => {
        const { databaseName, fields, databaseAddress } = this.state;

        this.setState({ message: 'processing...', inProgress: true, type: 'processing' });

        let _databaseContract;

        getDatabaseContract(databaseAddress)
            .then((databaseContract) => {
                _databaseContract = databaseContract;
                return deploySchema(databaseName, fields, databaseContract);
            })
            .then(() => eventPromise(_databaseContract.DatabaseInitialized()))
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
        const canCreateSchema = fieldsCount > 0 && fieldsCount <= MAX_FIELD_COUNT && !isSchemaCreated;

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
                    {isSchemaCreated ? (
                        <CircleLable type='complete' number='2' text='Schema definition' />
                    ) : (
                        <CircleLable type='edit' number='2' text='Schema definition' />
                    ) }
                    <CircleLable number='3' text='Contract code saving' />
                </ProgressBar>

                <ContainerRegister>
                    <SideBar>
                        <Label>Input</Label>

                        <Panel title='Record Structure' noPadding>
                            <FieldsTable>
                                <TableRegistry>
                                    <tbody>
                                        {fields.map(field => (
                                            <tr key={ field.name }>
                                                <td>{field.name}</td>
                                                <td>{field.type}</td>
                                                <td>
                                                    <Checkbox disabled checked={field.unique}>unique</Checkbox>
                                                </td>
                                                <td>
                                                    <RemoveButton
                                                        onClick={ () => this.remove(field.name) }
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                        {!isSchemaCreated &&
                                            <tr>
                                                <td>
                                                    <WideInput
                                                        inputRef={node => this.fieldName = node}
                                                        placeholder='Name'
                                                    />
                                                </td>
                                                <td>
                                                    <WideSelect
                                                        inputRef={node => this.fieldType = node}
                                                        onChange={this.onFieldTypeChange}
                                                    >
                                                        <option value='string'>string</option>
                                                        <option value='address'>address</option>
                                                        <option value='bool'>bool</option>
                                                        <option value='uint256'>uint256</option>
                                                        <option value='int256'>int256</option>
                                                    </WideSelect>
                                                </td>
                                                <td hidden={disableUniqueCheckbox}>
                                                    <Checkbox inputRef={node => this.fieldUnique = node}>unique</Checkbox>
                                                </td>
                                                <td>
                                                    <AddButton
                                                        onClick={this.add}
                                                    />
                                                </td>
                                            </tr>
                                        }
                                    </tbody>
                                </TableRegistry>
                            </FieldsTable>
                        </Panel>
                    </SideBar>

                    <Content>
                        <Label color='#3fb990'>Database code</Label>
                        <DarkPanel>
                            <Code>
                                {code}
                            </Code>
                        </DarkPanel>
                        {(type === 'error' && message) && <ErrorMessage>{message}</ErrorMessage>}
                    </Content>

                </ContainerRegister>

                <RightContainer>
                    {isSchemaCreated ? (
                        <ActionLink to={ `/databases/${databaseSymbol}` }>Go to database</ActionLink>
                    ) : (
                        <CreateButton disabled={ !canCreateSchema } onClick={ this.createSchema }>
                            create
                        </CreateButton>
                    )}
                </RightContainer>
            </div>
        );
    }
}

export default SchemaDefinition;
