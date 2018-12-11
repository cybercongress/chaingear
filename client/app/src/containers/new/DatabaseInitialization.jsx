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
    StatusBar,
    LinkHash,
    ActionLink,
    RightContainer,
    ParamRow,
    WideInput,
    Description,
    WideSelect,
    AddButton,
} from '@cybercongress/ui';

import {
    getDefaultAccount,
    deployDatabase,
    getChaingearContract,
    eventPromise, callContractMethod,
} from '../../utils/cyber';

import DatabaseSource from '../../resources/DatabaseV1.sol';
import Code from '../../components/SolidityHighlight';
import { debounce } from '../../utils/utils';

class NewDatabase extends Component {
    constructor(props) {
        super(props);

        this.state = {
            beneficiaries: [],
            databaseId: null,

            dbName: '',
            dbSymbol: '',
            dbVersion: '',

            isNameExist: true,
            isSymbolExist: true,

            inProgress: false,
            message: '',
            type: 'processing',
        };

        this.checkDbName = debounce(this.checkDbName, 1000);
        this.checkDbSymbol = debounce(this.checkDbSymbol, 1000);
    }

    componentWillMount() {
        getDefaultAccount()
            .then(defaultAccount => this.setState({
                beneficiaries: [{
                    address: defaultAccount,
                    stake: 1,
                    share: 100,
                }],
            }));
    }

    createDatabase = () => {
        const { beneficiaries, dbName, dbSymbol, dbVersion } = this.state;
        const bens = beneficiaries.map(ben => ben.address);
        const stakes = beneficiaries.map(ben => ben.stake);

        this.setState({ message: 'processing...', inProgress: true, type: 'processing' });
        deployDatabase(dbName, dbSymbol, dbVersion, bens, stakes)
            .then(({ txHash }) => getChaingearContract())
            .then(({ contract }) => eventPromise(contract.DatabaseCreated()))
            .then((results) => {
                this.setState({
                    inProgress: false,
                    databaseId: results.args.databaseChaingearID.toNumber(),
                });
            })
            .catch((error) => {
                console.log(`Cannot create database ${dbName}. Error: ${error}`);
            });
    };

    checkDbName = (dbName) => {
        if (!dbName) {
            return;
        }

        getChaingearContract()
            .then(({ contract }) => callContractMethod(contract, 'getNameExist', dbName))
            .then(isNameExist => this.setState({
                dbName,
                isNameExist,
            }));
    };

    checkDbSymbol = (dbSymbol) => {
        if (!dbSymbol) {
            return;
        }

        getChaingearContract()
            .then(({ contract }) => callContractMethod(contract, 'getSymbolExist', dbSymbol))
            .then(isSymbolExist => this.setState({
                dbSymbol,
                isSymbolExist,
            }));
    };

    onDbNameChange = (event) => {
        event.persist();

        this.dbSymbol.value = event.target.value;
        this.checkDbName(event.target.value);
        this.checkDbSymbol(this.dbSymbol.value);
    };

    onDbSymbolChange = (event) => {
        event.persist();

        this.checkDbSymbol(event.target.value);
    };

    onDbVersionChange = (event) => {
        this.setState({
            dbVersion: event.target.value,
        });
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
        const address = this.benAddress.value;
        const stake = this.benStake.value;
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

        this.benAddress.value = '';
        this.benStake.value = '';

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
            dbName, dbSymbol, dbVersion,
            isNameExist, isSymbolExist,
            beneficiaries, databaseId,
            message, inProgress, type,
        } = this.state;

        const benCount = beneficiaries.length;
        const canCreate = dbName.length > 0 && dbSymbol.length > 0 && dbVersion.length > 0
            && !isNameExist && !isSymbolExist
            && benCount > 0;

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
                            <ParamRow>
                                <WideInput
                                    placeholder='Name'
                                    onChange={ this.onDbNameChange }
                                />
                            </ParamRow>
                            <ParamRow>
                                <WideInput
                                    placeholder='Symbol'
                                    onChange={ this.onDbSymbolChange }
                                    inputRef={ node => this.dbSymbol = node }
                                />
                            </ParamRow>
                            <ParamRow>
                                <WideSelect onChange={this.onDbVersionChange}>
                                    <option value=''>Version</option>
                                    <option value='V1'>V1 (Basic Database)</option>
                                </WideSelect>
                            </ParamRow>
                            <ParamRow>
                                <Description>
                                    Bla-bla
                                </Description>
                            </ParamRow>
                        </Panel>

                        <Panel title='Beneficiaries (Optional)' noPadding>
                            <FieldsTable>
                                <tbody>
                                    {
                                        beneficiaries.map(ben => (
                                            <tr key={ ben.address }>
                                                <td style={{
                                                    textAlign: 'center',
                                                    overflow: 'hidden',
                                                    width: 120,
                                                }}
                                                >
                                                    <LinkHash value={ ben.address } />
                                                </td>
                                                <td style={{
                                                    textAlign: 'end',
                                                    width: 70,
                                                }}>{ben.stake}</td>
                                                <td style={{
                                                    textAlign: 'end',
                                                    width: 40
                                                }}>{ben.share}{' %'}</td>
                                                <td>
                                                    <RemoveButton
                                                      onClick={ () => this.removeBeneficiary(ben.address) }
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    }
                                    <tr>
                                        <td>
                                            <WideInput inputRef={ node => this.benAddress = node } placeholder='Address' />
                                        </td>
                                        <td>
                                            <WideInput inputRef={ node => this.benStake = node } onChange={this.onStakeChange} placeholder='Stake' />
                                        </td>
                                        <td style={{textAlign: 'end'}}>
                                            <span ref='benShare' placeholder='Share'>0</span> <span>%</span>
                                        </td>
                                        <td>
                                            <AddButton onClick={ this.addBeneficiary }/>
                                        </td>
                                    </tr>
                                </tbody>
                            </FieldsTable>
                        </Panel>
                    </SideBar>

                    <Content>
                        <Label color='#3fb990'>Database code</Label>
                        <div>
                            <Code>
                                {DatabaseSource}
                            </Code>
                        </div>
                        {(type === 'error' && message) && <ErrorMessage>{message}</ErrorMessage>}
                    </Content>
                </ContainerRegister>
                <RightContainer>
                    {databaseId ? (
                        <span>
                            <ActionLink to={ `/databases/${databaseId}` }>Go to database</ActionLink>
                            <ActionLink to={ `/schema/${databaseId}` }>Go to schema definition</ActionLink>
                        </span>
                    ) : (
                        <CreateButton disabled={ !canCreate } onClick={ this.createDatabase }>
                            Next
                        </CreateButton>
                    )}
                </RightContainer>
            </div>
        );
    }
}


export default NewDatabase;
