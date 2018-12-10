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
    getDatabases,
    deployDatabase,
    getChaingearContract,
    eventPromise,
} from '../../utils/cyber';

import DatabaseSource from '../../resources/DatabaseV1.sol';
import Code from '../../components/SolidityHighlight';

class NewDatabase extends Component {
    constructor(props) {
        super(props);

        this.state = {
            contractName: '',
            contracts: [],
            beneficiaries: [],
            databaseId: null,

            inProgress: false,
            message: '',
            type: 'processing',
        };
    }

    componentWillMount() {
        getDatabases()
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

    createDatabase = () => {
        const { contractName, beneficiaries } = this.state;
        const symbol = this.refs.symbol.value;
        const version = this.refs.databaseVersion.value;
        const bens = beneficiaries.map(ben => ben.address);
        const shares = beneficiaries.map(ben => ben.share);

        this.setState({ message: 'processing...', inProgress: true, type: 'processing' });
        deployDatabase(contractName, symbol, version, bens, shares)
            .then(({ txHash }) => getChaingearContract())
            .then(({ contract }) => eventPromise(contract.DatabaseCreated()))
            .then((results) => {
                this.setState({
                    inProgress: false,
                    databaseId: results.args.databaseId.toNumber(),
                });
            })
            .catch((error) => {
                console.log(`Cannot create database ${contractName}. Error: ${error}`);
            });
    };

    onContractNameChange = (e) => {
        this.setState({
            contractName: e.target.value,
        });

        this.refs.symbol.value = e.target.value;
    };

    onStakeChange = (e) => {
        const { value } = e.target;

        if (isNaN(value)) {
            e.target.value = '';
        }
    };

    calculateShare = (beneficiaries) => {
        let allStake = 0;

        beneficiaries.forEach((ben) => {
            allStake += +ben.stake;
        });

        return beneficiaries.map(ben => ({
            ...ben,
            share: (ben.stake / allStake * 100).toFixed(0),
        }));
    };

    addBeneficiary = () => {
        const address = this.refs.benAddress.value;
        const stake = this.refs.benStake.value;
        let { beneficiaries } = this.state;

        if (!address || !stake) {
            return;
        }

        beneficiaries.push({
            address,
            stake,
            share: 0,
        });

        beneficiaries = this.calculateShare(beneficiaries);

        this.refs.benAddress.value = '';
        this.refs.benStake.value = '';

        this.setState({
            beneficiaries,
        });
    };

    removeBeneficiary = (address) => {
        let { beneficiaries } = this.state;

        beneficiaries = beneficiaries.filter(ben => ben.address !== address);

        this.setState({
            beneficiaries: this.calculateShare(beneficiaries),
        });
    };

    render() {
        const {
            contractName, message, inProgress, contracts, type, beneficiaries, databaseId,
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
                />

                <PageTitle>New database creation</PageTitle>
                <ContainerRegister>
                    <SideBar>

                        <Label>Input</Label>
                        <Panel title='General Parameters'>
                            <Control title='Database Name:'>
                                <input
                                    placeholder='name'
                                    value={ contractName }
                                    onChange={ this.onContractNameChange }
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
                                <select ref='databaseVersion'>
                                    <option value='V1'>V1 (Basic Database)</option>
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
                                                <td style={ { overflow: 'hidden' } }><LinkHash value={ ben.address } /></td>
                                                <td>{ben.stake}</td>
                                                <td>{ben.share}</td>
                                                <td>
                                                    <RemoveButton
                                                      onClick={ () => this.removeBeneficiary(ben.address) }
                                                    >
                                                        {'X'}
                                                    </RemoveButton>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                    <tr>
                                        <td>
                                            <input ref='benAddress' />
                                        </td>
                                        <td>
                                            <input ref='benStake' onChange={this.onStakeChange} />
                                        </td>
                                        <td>
                                            <span ref='benShare'>0</span> <span>%</span>
                                        </td>
                                        <td>
                                            <div onClick={ this.addBeneficiary }>ADD</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </FieldsTable>
                        </Panel>
                    </SideBar>

                    <Content>
                        <Label color='#3fb990'>Database code</Label>
                        <Code>
                            {DatabaseSource}
                        </Code>
                        {(type === 'error' && message) && <ErrorMessage>{message}</ErrorMessage>}
                        {databaseId ? (
                            <span>
                                <ActionLink to={ `/databases/${databaseId}` }>Go to database</ActionLink>
                                <ActionLink to={ `/schema/${databaseId}` }>Go to schema definition</ActionLink>
                            </span>
                        ) : (
                            <CreateButton disabled={ !canCreate } onClick={ this.createDatabase }>
                                Create
                            </CreateButton>
                        )}
                    </Content>

                </ContainerRegister>
            </div>
        );
    }
}


export default NewDatabase;
