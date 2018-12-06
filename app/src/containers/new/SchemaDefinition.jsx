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
    AddField,
    StatusBar,
    ActionLink,
} from '@cybercongress/ui';

import {
    generateContractCode,
    getRegistries,
    deploySchema,
    getRegistryContract,
} from '../../utils/cyber';


import Code from '../../components/SolidityHighlight';

const MAX_FIELD_COUNT = 10;

class SchemaDefinition extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
            fields: [],
            contractName: '',
            contracts: [],
            gasEstimate: null,
            registryAddress: null,
            error: null,

            inProgress: false,
            message: '',
            type: 'processing',

            isSchemaCreated: false,
        };
    }

    componentDidMount() {
        getRegistries()
            .then((contracts) => {
                const registryAddress = this.props.params.address;
                const { name } = contracts.find(contract => contract.address === registryAddress);

                this.setState({
                    contracts,
                    registryAddress,
                    contractName: name,
                });
            });
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
        const { contractName, fields, registryAddress } = this.state;

        this.setState({ message: 'processing...', inProgress: true, type: 'processing' });

        let _registryContract;
        getRegistryContract(registryAddress)
            .then((registryContract) => {
                _registryContract = registryContract;
                return deploySchema(contractName, fields, registryContract);
            })
            //.then(() => cyber.eventPromise(_registryContract.registryInitialized()))
            .then(() => {
                this.setState({
                    inProgress: false,
                    isSchemaCreated: true,
                });
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
    }

    changeContractName = (e) => {
        this.setState({
            contractName: e.target.value,
        });

        this.refs.symbol.value = e.target.value;
    }

    render() {
        const {
            contractName, fields, message, inProgress, type, isSchemaCreated, registryAddress,
        } = this.state;
        const code = generateContractCode(contractName, fields);
        const fieldsCount = fields.length;
        const canDeploy = fieldsCount > 0 && fieldsCount <= MAX_FIELD_COUNT;

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
                            <CreateButton disabled={ !canDeploy } onClick={ this.create }>
                                create registry
                            </CreateButton>
                        </Panel>
                    </SideBar>

                    <Content>
                        <Label color='#3fb990'>Registry code</Label>
                        <Code>
                            {code}
                        </Code>
                        {(type === 'error' && message) && <ErrorMessage>{message}</ErrorMessage>}
                        {isSchemaCreated &&
                            <ActionLink to={`/registers/${registryAddress}`}>Go to registry</ActionLink>
                        }
                    </Content>

                </ContainerRegister>

            </div>
        );
    }
}


export default SchemaDefinition;
