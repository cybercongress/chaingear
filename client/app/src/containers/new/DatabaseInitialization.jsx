import React, { Component } from 'react';

import {
    Content, ContainerRegister, SideBar,
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
    DarkPanel,
    Code,
    ProgressBar,
    CircleLable,
    Table, TableRow, TableItem, TableAddRow,
} from '@cybercongress/ui';

import {
    getDefaultAccount,
    deployDatabase,
    getChaingearContract,
    eventPromise, callContractMethod,
} from '../../utils/cyber';

import DatabaseSource from '../../resources/DatabaseV1.sol';
import { calculateBensShares, debounce } from '../../utils/utils';

class NewDatabase extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dbBuilders: [],
            dbDescription: '',

            beneficiaries: [],
            databaseId: null,

            dbName: '',
            dbSymbol: '',
            dbVersion: '',

            isNameValid: true,
            isSymbolValid: true,
            nameErrorMessage: '',
            symbolErrorMessage: '',

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
            }))
            .then(() => this.getDatabaseVersions());
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
                this.setState({
                    inProgress: false,
                });
            });
    };

    getDatabaseVersions = () => {
        let _chaingerContract;

        return getChaingearContract()
            .then(({contract}) => {
                _chaingerContract = contract;
                return callContractMethod(contract, 'getAmountOfBuilders');
            })
            .then((buildersCount) => {
                const buildersCountNumber = buildersCount.toNumber();
                let buildersPromises = [];

                for (let index = 0; index < buildersCountNumber; index = index + 1) {
                    const builderPromise = callContractMethod(_chaingerContract, 'getBuilderById', index)
                        .then(builderVersion => Promise.all([
                            callContractMethod(_chaingerContract, 'getDatabaseBuilder', builderVersion),
                            builderVersion,
                        ]))
                        .then(([builderMeta, builderVersion]) => (
                            {
                                version: builderVersion,
                                description: builderMeta[2],
                            }
                        ));

                    buildersPromises.push(builderPromise);
                }

                return Promise.all(buildersPromises);
            })
            .then(dbBuilders => this.setState({ dbBuilders }));
    };

    checkDbName = (dbName) => {
        if (!dbName) {
            this.setState({
                dbName,
                isNameValid: true,
            });

            return;
        }

        let _isNameValid = true;
        let _errorMessage = '';

        this.checkRegexp(dbName)
            .then((isValid) => {
                if (!isValid) {
                    _isNameValid = false;
                    _errorMessage = 'letters, digits and dash only';

                    throw new Error('invalid string');
                }
            })
            .then(() => getChaingearContract())
            .then(({ contract }) => callContractMethod(contract, 'getNameExist', dbName))
            .then((isNameExist) => {
                if (isNameExist) {
                    _isNameValid = false;
                    _errorMessage = 'Database name already exist';
                }
            })
            .then(() => {
                this.setState({
                    dbName,
                    isNameValid: _isNameValid,
                    nameErrorMessage: _errorMessage,
                });
            })
            .catch(() => {
                this.setState({
                    dbName,
                    isNameValid: _isNameValid,
                    nameErrorMessage: _errorMessage,
                });
            });
    };

    checkDbSymbol = (dbSymbol) => {
        if (!dbSymbol) {
            this.setState({
                dbSymbol,
                isSymbolValid: true,
            });

            return;
        }

        let _isSymbolValid = true;
        let _errorMessage = '';

        this.checkRegexp(dbSymbol)
            .then((isValid) => {
                if (!isValid) {
                    _isSymbolValid = false;
                    _errorMessage = 'letters, digits and dash only';

                    throw new Error('invalid string');
                }
            })
            .then(() => getChaingearContract())
            .then(({ contract }) => callContractMethod(contract, 'getSymbolExist', dbSymbol))
            .then((isSymbolExist) => {
                if (isSymbolExist) {
                    _isSymbolValid = false;
                    _errorMessage = 'Symbol already exist';
                }
            })
            .then(() => {
                this.setState({
                    dbSymbol,
                    isSymbolValid: _isSymbolValid,
                    symbolErrorMessage: _errorMessage,
                });
            })
            .catch(() => {
                this.setState({
                    dbSymbol,
                    isSymbolValid: _isSymbolValid,
                    symbolErrorMessage: _errorMessage,
                });
            });
    };

    checkRegexp = (string) => {
        return new Promise(resolve => resolve(/\b[a-zA-Z][a-zA-Z0-9_]*$/.test(string)));
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
        const { dbBuilders } = this.state;
        const builderVersion = event.target.value;
        const dbBuilder = dbBuilders.find(builder => builder.version === builderVersion);
        const description = dbBuilder ? dbBuilder.description : null;

        this.setState({
            dbVersion: event.target.value,
            dbDescription: description,
        });
    };

    onStakeChange = (e) => {
        const { value } = e.target;

        if (isNaN(value)) {
            e.target.value = '';
        }
    };

    addBeneficiary = () => {
        const address = this.benAddress.value;
        const stake = this.benStake.value;
        const { beneficiaries } = this.state;

        if (!address || !stake) {
            return;
        }

        this.benAddress.value = '';
        this.benStake.value = '';

        this.setState({
            beneficiaries: beneficiaries.concat([{
                address,
                stake,
                share: 0,
            }]),
        });
    };

    removeBeneficiary = (address) => {
        const { beneficiaries } = this.state;

        this.setState({
            beneficiaries: beneficiaries.filter(ben => ben.address !== address),
        });
    };

    render() {
        const {
            dbName, dbSymbol, dbVersion, dbBuilders, dbDescription,
            isNameValid, isSymbolValid, databaseId, beneficiaries,
            message, inProgress, type,
            nameErrorMessage, symbolErrorMessage,
        } = this.state;

        const bens = calculateBensShares(beneficiaries);
        const benCount = beneficiaries.length;
        const canCreate = dbName.length > 0 && dbSymbol.length > 0 && dbVersion.length > 0
            && isNameValid && isSymbolValid
            && benCount > 0;

        return (
            <div>
                <StatusBar
                    open={ inProgress }
                    message={ message }
                    type={ type }
                />

                <PageTitle>New database creation</PageTitle>

                <ProgressBar>
                    <CircleLable type='edit' number='1' text='Database initialization' />
                    <CircleLable number='2' text='Schema definition' />
                    <CircleLable number='3' text='Contract code saving' />
                </ProgressBar>

                <ContainerRegister>
                    <SideBar>

                        <Label>Input</Label>
                        <Panel title='General Parameters'>
                            <ParamRow>
                                <WideInput
                                    placeholder='Name'
                                    onChange={ this.onDbNameChange }
                                    valid={ isNameValid }
                                    errorMessage={ nameErrorMessage }
                                />
                            </ParamRow>
                            <ParamRow>
                                <WideInput
                                    placeholder='Symbol'
                                    onChange={ this.onDbSymbolChange }
                                    inputRef={ node => this.dbSymbol = node }
                                    valid={ isSymbolValid }
                                    errorMessage={ symbolErrorMessage }
                                />
                            </ParamRow>
                            <ParamRow>
                                <WideSelect onChange={this.onDbVersionChange}>
                                    <option key='default' value=''>Version</option>
                                    {
                                        dbBuilders.map(builder => (
                                            <option key={builder.version} value={builder.version}>{builder.version}</option>
                                        ))
                                    }
                                </WideSelect>
                            </ParamRow>

                            {dbDescription &&
                                <ParamRow>
                                    <Description>
                                        <b>Description:</b> {dbDescription}
                                    </Description>
                                </ParamRow>
                            }
                        </Panel>

                        <Panel title='Beneficiaries (Optional)' noPadding>
                            <Table>
                                {bens.map(ben => (
                                    <TableRow key={ben.address}>
                                        <TableItem>
                                            <LinkHash noCopy noPadding value={ben.address} />
                                        </TableItem>
                                        <TableItem>{ben.stake}</TableItem>
                                        <TableItem>{ben.share} %</TableItem>
                                        <TableItem>
                                            <RemoveButton onClick={ () => this.removeBeneficiary(ben.address) } />
                                        </TableItem>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableItem>
                                        <WideInput inputRef={ node => this.benAddress = node } placeholder='Address' />
                                    </TableItem>
                                    <TableItem>
                                        <WideInput inputRef={ node => this.benStake = node } onChange={this.onStakeChange} placeholder='Stake' />
                                    </TableItem>
                                    <TableItem>
                                        <span ref='benShare' placeholder='Share'>0</span> <span>%</span>
                                    </TableItem>
                                    <TableItem>
                                        <AddButton onClick={ this.addBeneficiary }/>
                                    </TableItem>
                                </TableRow>
                            </Table>
                           {/* <FieldsTable>
                                <tbody>
                                    {
                                        bens.map(ben => (
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
                                                       }
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
                            </FieldsTable>*/}
                        </Panel>
                    </SideBar>

                    <Content>
                        <Label color='#3fb990'>Database code</Label>
                        <DarkPanel>
                            <Code>
                                {DatabaseSource}
                            </Code>
                        </DarkPanel>
                        {(type === 'error' && message) && <ErrorMessage>{message}</ErrorMessage>}
                    </Content>
                </ContainerRegister>
                <RightContainer>
                    {databaseId ? (
                        <span>
                            <ActionLink to={ `/databases/${dbSymbol}` }>Go to database</ActionLink>
                            <ActionLink style={{marginLeft: 15}} to={ `/schema/${dbSymbol}` }>Go to schema definition</ActionLink>
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
