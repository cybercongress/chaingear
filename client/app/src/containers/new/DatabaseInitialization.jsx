import React, { Component } from 'react';

import {
    Content, ContainerRegister, SideBar,
    Panel, PageTitle, RemoveButton,
    Message, StatusBar, LinkHash,
    ParamRow, WideInput, WideSelect,
    AddButton, Code, ProgressBar,
    CircleLable, TableItemBen, TableRegistry,
    FlexContainer, FlexContainerLeft, FlexContainerRight,
    Button, Text,
} from '@cybercongress/ui';

import {
    getDefaultAccount,
    deployDatabase,
    getChaingearContract,
    eventPromise, callContractMethod, init,
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

            nameErrorMessage: null,
            symbolErrorMessage: null,

            inProgress: false,
            message: '',
            type: 'processing',
        };

        this.checkDbName = debounce(this.checkDbName, 1000);
        this.checkDbSymbol = debounce(this.checkDbSymbol, 1000);
    }

    componentWillMount() {
        init()
            .then(() => getDefaultAccount())
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
            .then(contract => eventPromise(contract.DatabaseCreated()))
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
        let chaingerContract;

        return getChaingearContract()
            .then((contract) => {
                chaingerContract = contract;
                return callContractMethod(contract, 'getAmountOfBuilders');
            })
            .then((buildersCount) => {
                const buildersCountNumber = buildersCount.toNumber();
                const buildersPromises = [];

                for (let index = 0; index < buildersCountNumber; index += 1) {
                    const builderPromise = callContractMethod(chaingerContract, 'getBuilderById', index)
                        .then(builderVersion => Promise.all([
                            callContractMethod(chaingerContract, 'getDatabaseBuilder', builderVersion),
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
            });

            return;
        }

        let errorMessage = null;

        this.checkRegexp(dbName)
            .then((isValid) => {
                if (!isValid) {
                    errorMessage = 'letters, digits and dash only';

                    throw new Error('invalid string');
                }
            })
            .then(() => getChaingearContract())
            .then(contract => callContractMethod(contract, 'getNameExist', dbName))
            .then((isNameExist) => {
                if (isNameExist) {
                    errorMessage = 'Database name already exist';
                }
            })
            .then(() => {
                this.setState({
                    dbName,
                    nameErrorMessage: errorMessage,
                });
            })
            .catch(() => {
                this.setState({
                    dbName,
                    nameErrorMessage: errorMessage,
                });
            });
    };

    checkDbSymbol = (dbSymbol) => {
        if (!dbSymbol) {
            this.setState({
                dbSymbol,
            });

            return;
        }

        let errorMessage = '';

        this.checkRegexp(dbSymbol)
            .then((isValid) => {
                if (!isValid) {
                    errorMessage = 'letters, digits and dash only';

                    throw new Error('invalid string');
                }
            })
            .then(() => getChaingearContract())
            .then(contract => callContractMethod(contract, 'getSymbolExist', dbSymbol))
            .then((isSymbolExist) => {
                if (isSymbolExist) {
                    errorMessage = 'Symbol already exist';
                }
            })
            .then(() => {
                this.setState({
                    dbSymbol,
                    symbolErrorMessage: errorMessage,
                });
            })
            .catch(() => {
                this.setState({
                    dbSymbol,
                    symbolErrorMessage: errorMessage,
                });
            });
    };

    checkRegexp = string => new Promise(resolve => resolve(/\b[a-zA-Z][a-zA-Z0-9_]*$/.test(string)));

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
            databaseId, beneficiaries,
            message, inProgress, type,
            nameErrorMessage, symbolErrorMessage,
        } = this.state;

        const bens = calculateBensShares(beneficiaries);
        const benCount = beneficiaries.length;
        const canCreate = dbName.length > 0 && dbSymbol.length > 0 && dbVersion.length > 0
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
                    <CircleLable type={ databaseId ? 'complete' : 'edit' } number='1' text='Database initialization' />
                    <CircleLable number='2' text='Schema definition' />
                </ProgressBar>

                <ContainerRegister>
                    <SideBar title='Input'>
                        <Panel title='General Parameters'>
                            <ParamRow>
                                <WideInput
                                  placeholder='Name'
                                  onChange={ this.onDbNameChange }
                                  errorMessage={ nameErrorMessage }
                                  disabled={ !!databaseId }
                                />
                            </ParamRow>
                            <ParamRow>
                                <WideInput
                                  placeholder='Symbol'
                                  onChange={ this.onDbSymbolChange }
                                  inputRef={ (node) => { this.dbSymbol = node; } }
                                  errorMessage={ symbolErrorMessage }
                                  disabled={ !!databaseId }
                                />
                            </ParamRow>
                            <ParamRow>
                                <WideSelect
                                  onChange={ this.onDbVersionChange }
                                  disabled={ !!databaseId }
                                >
                                    <option key='default' value=''>Version</option>
                                    {
                                        dbBuilders.map(builder => (
                                            <option
                                              key={ builder.version }
                                              value={ builder.version }
                                            >
                                                {builder.version}
                                            </option>
                                        ))
                                    }
                                </WideSelect>
                            </ParamRow>

                            {dbDescription
                                && (
                                    <ParamRow>
                                        <Text size='sm' lineheight justify>
                                            <b>Description: </b>
                                            {dbDescription}
                                        </Text>
                                    </ParamRow>
                                )
                            }
                        </Panel>

                        <Panel title='Beneficiaries (Optional)' noPadding>
                            <TableItemBen>
                                <tbody>
                                    {bens.map(ben => (
                                        <tr key={ ben.address }>
                                            <td>
                                                <LinkHash noCopy noPadding value={ ben.address } />
                                            </td>
                                            <td>{ben.stake}</td>
                                            <td>{`${ben.share} %`}</td>
                                            {!databaseId && (
                                                <td>
                                                    <RemoveButton
                                                      onClick={
                                                          () => this.removeBeneficiary(ben.address)
                                                      }
                                                    />
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </TableItemBen>
                            {!databaseId && (
                                <TableRegistry>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <WideInput
                                                  inputRef={ (node) => { this.benAddress = node; } }
                                                  placeholder='Address'
                                                />
                                            </td>
                                            <td>
                                                <WideInput
                                                  inputRef={ (node) => { this.benStake = node; } }
                                                  onChange={ this.onStakeChange }
                                                  placeholder='Stake'
                                                />
                                            </td>
                                            <td>
                                                <span ref='benShare' placeholder='Share'>0</span>
                                                <span>%</span>
                                            </td>
                                            <td>
                                                <AddButton onClick={ this.addBeneficiary } />
                                            </td>
                                        </tr>
                                    </tbody>
                                </TableRegistry>
                            )}
                        </Panel>

                    </SideBar>

                    <Content title='Database code'>
                        <Code>
                            {DatabaseSource}
                        </Code>
                    </Content>
                </ContainerRegister>
                <FlexContainer>
                    <FlexContainerLeft>
                        {(type === 'error' && message) && <Message type='error'>{message}</Message>}
                    </FlexContainerLeft>
                    <FlexContainerRight>
                        {databaseId ? (
                            <span>
                                <Button color='blue' style={ { marginRight: '10px' } } to={ `/databases/${dbSymbol}` }>Go to database</Button>
                                <Button color='blue' to={ `/schema/${dbSymbol}` }>Go to schema definition</Button>
                            </span>
                        ) : (
                            <Button type='button' color='blue' disabled={ !canCreate } onClick={ this.createDatabase }>
                                Create
                            </Button>
                        )}
                    </FlexContainerRight>
                </FlexContainer>
            </div>
        );
    }
}


export default NewDatabase;
