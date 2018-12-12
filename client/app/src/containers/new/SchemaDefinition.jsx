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

import Code from '../../components/SolidityHighlight';

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
        };
    }

    componentDidMount() {
        const dbsymbol = this.props.params.dbsymbol;
        let _chaingearContract;
        let _databaseId;

        getChaingearContract()
            .then(({ contract }) => {
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

    add = (name, type, unique) => {
        const newItem = {
            name,
            type,
            unique,
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

    render() {
        const {
            databaseName, fields, message, inProgress, type, isSchemaCreated, databaseSymbol,
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
                <ContainerRegister>
                    <SideBar>
                        <Label>Input</Label>

                        <Panel title='Schema Structure' noPadding>
                            <FieldsTable>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Validation</th>
                                        <th />
                                    </tr>
                                </thead>
                                <tbody>
                                    {fields.map(field => (
                                        <tr key={ field.name }>
                                            <td>{field.name}</td>
                                            <td>{field.type}</td>
                                            <td style={{textAlign: 'center'}}>
                                                <input type='checkbox' disabled checked={field.unique}/>
                                            </td>
                                            <td style={{textAlign: 'end'}}>
                                                <RemoveButton
                                                    onClick={ () => this.remove(field.name) }
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    <AddField
                                      onAdd={ this.add }
                                      fields={ fields }
                                    />
                                </tbody>
                            </FieldsTable>
                        </Panel>
                    </SideBar>

                    <Content>
                        <Label color='#3fb990'>Database code</Label>
                        <Code>
                            {code}
                        </Code>
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
