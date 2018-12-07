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
} from '@cybercongress/ui';

import {
    generateContractCode,
    deploySchema,
    getRegistryContract,
    getChaingearContract,
    callContractMethod,
    mapRegistry,
} from '../../utils/cyber';

import Code from '../../components/SolidityHighlight';

const MAX_FIELD_COUNT = 10;

class SchemaDefinition extends Component {

    constructor(props) {
        super(props);

        this.state = {
            fields: [],
            contractName: '',
            registryAddress: null,
            registryId: null,

            inProgress: false,
            message: '',
            type: 'processing',

            isSchemaCreated: false,
        };
    }

    componentDidMount() {
        const registryId = this.props.params.id;

        getChaingearContract()
            .then(({ contract }) => callContractMethod(contract, 'readRegistry', registryId))
            .then(registry => mapRegistry(registry, registryId))
            .then(registry => this.setState({
                registryAddress: registry.address,
                contractName: registry.name,
                registryId,
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
        const { contractName, fields, registryAddress } = this.state;

        this.setState({ message: 'processing...', inProgress: true, type: 'processing' });

        let _registryContract;

        getRegistryContract(registryAddress)
            .then((registryContract) => {
                _registryContract = registryContract;
                return deploySchema(contractName, fields, registryContract);
            })
            // .then(() => cyber.eventPromise(_registryContract.registryInitialized()))
            .then(() => {
                this.setState({
                    inProgress: false,
                    isSchemaCreated: true,
                });
            });
    };

    render() {
        const {
            contractName, fields, message, inProgress, type, isSchemaCreated, registryId,
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

                <PageTitle>Registry schema definition</PageTitle>
                <ContainerRegister>
                    <SideBar>
                        <Label>Input</Label>

                        <Panel title='EntryCore Structure' noPadding>
                            <FieldsTable>
                                <thead>
                                    <tr>
                                        <th>Field</th>
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
                                                >
                                                remove
                                                </RemoveButton>
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
                        <Label color='#3fb990'>Registry code</Label>
                        <Code>
                            {code}
                        </Code>
                        {(type === 'error' && message) && <ErrorMessage>{message}</ErrorMessage>}
                        {isSchemaCreated ? (
                            <ActionLink to={ `/registers/${registryId}` }>Go to registry</ActionLink>
                        ) : (
                            <CreateButton disabled={ !canCreateSchema } onClick={ this.createSchema }>
                                create
                            </CreateButton>
                        )}
                    </Content>

                </ContainerRegister>

            </div>
        );
    }
}

export default SchemaDefinition;
