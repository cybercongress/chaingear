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
            contractName: '',
            databaseAddress: null,
            databaseId: null,

            inProgress: false,
            message: '',
            type: 'processing',

            isSchemaCreated: false,
        };
    }

    componentDidMount() {
        const databaseId = this.props.params.id;

        getChaingearContract()
            .then(({ contract }) => callContractMethod(contract, 'getDatabase', databaseId))
            .then(database => mapDatabase(database, databaseId))
            .then(database => this.setState({
                databaseAddress: database.address,
                contractName: database.name,
                databaseId,
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

    createSchema = () => {
        const { contractName, fields, databaseAddress } = this.state;

        this.setState({ message: 'processing...', inProgress: true, type: 'processing' });

        let _databaseContract;

        getDatabaseContract(databaseAddress)
            .then((databaseContract) => {
                _databaseContract = databaseContract;
                return deploySchema(contractName, fields, databaseContract);
            })
            .then(() => eventPromise(_databaseContract.DatabaseInitialized()))
            .then(() => {
                this.setState({
                    inProgress: false,
                    isSchemaCreated: true,
                });
            });
    };

    render() {
        const {
            contractName, fields, message, inProgress, type, isSchemaCreated, databaseId,
        } = this.state;
        const code = generateContractCode(contractName, fields);
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
                                        <th />
                                    </tr>
                                </thead>
                                <tbody>
                                    {fields.map(field => (
                                        <tr key={ field.name }>
                                            <td>{field.name}</td>
                                            <td>{field.type}</td>
                                            <td>
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
                        <ActionLink to={ `/databases/${databaseId}` }>Go to database</ActionLink>
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
