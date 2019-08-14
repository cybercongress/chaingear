import React, { Component } from 'react';
import { Link } from 'react-router';

import {
    // Content, ContainerRegister, SideBar,
    // Panel, PageTitle, RemoveButton,
    // Message, StatusBar, LinkHash,
    // ParamRow, WideInput, WideSelect,
    // AddButton, Code, ProgressBar,
    // CircleLable, TableItemBen, TableRegistry,
    // FlexContainer, FlexContainerLeft, FlexContainerRight,
    // Button, Text,
    Input,
    Pane,
    Button,
    TableEv as Table,
    TextInput,
    Select,
    Tablist,
    Tab,
    TextEv as Text,
    IconButton,
    MainContainer,
    Code,
    Message,
    ScrollContainer,
    Section,
} from '@cybercongress/ui';

import {
    getDefaultAccount,
    deployDatabase,
    getChaingearContract,
    eventPromise,
    callContractMethod,
    init,
} from '../../utils/cyber';

import DatabaseSource from '../../resources/DatabaseV1.sol';
import { calculateBensShares, debounce } from '../../utils/utils';

const DB_NAME_REGEXP = /\b[a-z0-9][a-z0-9-]*$/;
const DB_SYMBOL_REGEXP = /\b[A-Z0-9][A-Z0-9-]*$/;

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
            dbNameValue: '',
            benAddressValue: '',
            benStakeValue: '',

            nameErrorMessage: null,
            symbolErrorMessage: null,

            inProgress: false,
            message: '',
            type: 'processing',
            tab: 'input',
        };

        this.checkDbName = debounce(this.checkDbName, 1000);
        this.checkDbSymbol = debounce(this.checkDbSymbol, 1000);
        this.nameOnChange = this.nameOnChange.bind(this);
    }

    componentWillMount() {
        init()
            .then(() => getDefaultAccount())
            .then(defaultAccount => this.setState({
                beneficiaries: [
                    {
                        address: defaultAccount,
                        stake: 1,
                        share: 100,
                    },
                ],
            }))
            .then(() => this.getDatabaseVersions());
    }

    createDatabase = () => {
        const {
            beneficiaries, dbName, dbSymbol, dbVersion,
        } = this.state;
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
                    const builderPromise = callContractMethod(
                        chaingerContract,
                        'getBuilderByID',
                        index,
                    )
                        .then(builderVersion => Promise.all([
                            callContractMethod(
                                chaingerContract,
                                'getDatabaseBuilder',
                                builderVersion,
                            ),
                            builderVersion,
                        ]))
                        .then(([builderMeta, builderVersion]) => ({
                            version: builderVersion,
                            description: builderMeta[2],
                        }));

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

        this.checkRegexp(DB_NAME_REGEXP, dbName)
            .then((isValid) => {
                if (!isValid) {
                    errorMessage = 'Lowercase letters, digits and dash only';

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

        this.checkRegexp(DB_SYMBOL_REGEXP, dbSymbol)
            .then((isValid) => {
                if (!isValid) {
                    errorMessage = 'Uppercase letters, digits and dash only';

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

    checkRegexp = (regexp, value) => new Promise(resolve => resolve(regexp.test(value)));

    nameOnChange(event) {
        this.setState({
            name: event.target.value,
        });
    }

    onDbNameChange = async (event) => {
        event.persist();
        await this.setState({
            dbNameValue: event.target.value,
            dbSymbol: event.target.value.toUpperCase(),
        });

        // this.dbSymbol.value = value.toUpperCase();
        this.checkDbName(event.target.value);
        this.checkDbSymbol(this.state.dbSymbol);
    };

    onDbSymbolChange = async (event) => {
        event.persist();

        await this.setState({
            dbSymbol: event.target.value.toUpperCase(),
        });

        this.checkDbSymbol(this.state.dbSymbol);
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

    benAddressValueOnChange = (e) => {
        const { value } = e.target;

        this.setState({
            benAddressValue: value,
        });
    }

    onStakeChange = (e) => {
        const { value } = e.target;

        this.setState({
            benStakeValue: value,
        });

        if (isNaN(value)) {
            e.target.value = '';
        }
    };

    addBeneficiary = () => {
        const address = this.state.benAddressValue;
        const stake = this.state.benStakeValue;
        const { beneficiaries } = this.state;

        if (!address || !stake) {
            return;
        }

        this.state.benAddressValue = '';
        this.state.benStakeValue = '';

        this.setState({
            beneficiaries: beneficiaries.concat([
                {
                    address,
                    stake,
                    share: 0,
                },
            ]),
        });
    };

    removeBeneficiary = (address) => {
        const { beneficiaries } = this.state;

        this.setState({
            beneficiaries: beneficiaries.filter(ben => ben.address !== address),
        });
    };

    select = (tab) => {
        this.setState({ tab });
    };

    render() {
        const {
            dbName,
            dbNameValue,
            dbSymbol,
            dbVersion,
            dbBuilders,
            dbDescription,
            databaseId,
            beneficiaries,
            message,
            inProgress,
            type,
            nameErrorMessage,
            symbolErrorMessage,
            tab,
            benAddressValue,
            benStakeValue,
        } = this.state;

        let content;

        const bens = calculateBensShares(beneficiaries);
        const benCount = beneficiaries.length;
        const canCreate = dbName.length > 0 && dbSymbol.length > 0 && dbVersion.length > 0 && benCount > 0;

        const FooterCyb = () => (
            <Pane
              display='flex'
              alignItems='center'
              justifyContent='center'
              width='100%'
              position='absolute'
              bottom={ 0 }
              paddingY={ 20 }
              backgroundColor='#000000'
              zIndex={ 2 }
            >
                <Pane
                    //   flexGrow={ 1 }
                    //   maxWidth={ 1000 }
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                  flexDirection='row'
                  paddingX='3vw'
                >
                    {databaseId ? (
                        <span>
                            <Link
                              className='btn link-btn'
                              to={ `/databases/${dbSymbol}` }
                            >
                                Go to database
                            </Link>
                            <Link
                              className='btn link-btn'
                              to={ `/schema/${dbSymbol}` }
                            >
                                Go to schema definition
                            </Link>
                        </span>
                    ) : (
                        <Button
                          paddingX={ 50 }
                          height={ 42 }
                          className='btn'
                          disabled={ !canCreate }
                          onClick={ this.createDatabase }
                        >
                            Create database
                        </Button>
                    )}
                </Pane>
            </Pane>
        );

        const beneficiariesRows = bens.map((ben, index) => (
            <Table.Row
              style={ { border: 0 } }
                //   boxShadow='0px 0px 0.1px 0px #ddd'
              className='validators-table-row'
              paddingLeft='1rem'
              borderBottom='none'
              key={ index }
            >
                <Table.TextCell textAlign='start' flexGrow={ 2 }>
                    <span style={ { color: '#fff' } }>{ben.address}</span>
                </Table.TextCell>
                <Table.TextCell textAlign='end'>
                    <span style={ { color: '#fff' } }>{ben.stake}</span>
                </Table.TextCell>
                <Table.TextCell textAlign='center' flexGrow={ 1 }>
                    <span style={ { color: '#fff' } }>
                        {ben.share}
%
                    </span>
                </Table.TextCell>
                <Table.TextCell flex='none' width={ 48 }>
                    <IconButton
                      icon='trash'
                      appearance='minimal'
                      className='icon-btn color-white-svg'
                      onClick={ () => this.removeBeneficiary(ben.address) }
                    />
                </Table.TextCell>
            </Table.Row>
        ));

        // const TabOutput = () => (

        // );

        // if  {
        //     content = <TabInput />;
        // }

        // if (tab === 'output') {
        //     content = <TabOutput />;
        // }

        return (
            <span>
                <ScrollContainer style={ { height: '100vh' } }>
                    <MainContainer
                      style={ {
                            paddingTop: '2.5rem',
                            paddingBottom: '6rem',
                        } }
                    >
                        <Pane
                          display='flex'
                          flexDirection='column'
                          alignItems='center'
                          justifyContent='center'
                        >
                            <Tablist marginBottom={ 24 }>
                                <Tab
                                  key='Input'
                                  id='Input'
                                  isSelected={ tab === 'input' }
                                  onClick={ () => this.select('input') }
                                  paddingX={ 50 }
                                  paddingY={ 20 }
                                  marginX={ 3 }
                                  borderRadius={ 4 }
                                  color='#36d6ae'
                                  boxShadow='0px 0px 10px #36d6ae'
                                  fontSize='16px'
                                >
                                    Input
                                </Tab>
                                <Tab
                                  key='Output'
                                  id='Output'
                                  isSelected={ tab === 'output' }
                                  onClick={ () => this.select('output') }
                                  paddingX={ 50 }
                                  paddingY={ 20 }
                                  marginX={ 3 }
                                  borderRadius={ 4 }
                                  color='#36d6ae'
                                  boxShadow='0px 0px 10px #36d6ae'
                                  fontSize='16px'
                                >
                                    Output
                                </Tab>
                            </Tablist>
                        </Pane>

                        {tab === 'input' && (
                            <Pane>
                                <Section title='General database parameters'>
                                    <Pane
                                      backgroundColor='#000'
                                      display='grid'
                                      gridTemplateColumns='1fr 1fr'
                                      gridGap={ 30 }
                                      paddingX='2rem'
                                      paddingY='2rem'
                                      borderRadius={ 5 }
                                      boxShadow='0 0 2px #36d6ae'
                                      width='100%'
                                    >
                                        <Pane>
                                            <Input
                                              placeholder='Name'
                                                // //   defaultValue=''
                                              marginBottom='1rem'
                                              className='input-green'
                                              name='Name'
                                              value={ dbNameValue }
                                              onChange={ this.onDbNameChange }
                                              message={ nameErrorMessage }
                                            //   isInvalid={ !!databaseId }
                                              disabled={ !!databaseId }
                                            />
                                            <Input
                                                //   defaultValue=''
                                              placeholder='Symbol'
                                              marginBottom='1rem'
                                              className='input-green'
                                              onChange={ this.onDbSymbolChange }
                                              value={ dbSymbol }
                                            //   isInvalid={ !!databaseId }
                                                //   inputRef={ (node) => {
                                                //         this.dbSymbol = node;
                                                //     } }
                                              message={ symbolErrorMessage }
                                              disabled={ !!databaseId }
                                            />
                                            <Select
                                              className='select-green'
                                              width='100%'
                                              onChange={ this.onDbVersionChange }
                                              disabled={ !!databaseId }
                                            >
                                                <option value=''>Version</option>
                                                {dbBuilders.map(builder => (
                                                    <option
                                                      key={ builder.version }
                                                      value={ builder.version }
                                                    >
                                                        {builder.version}
                                                    </option>
                                                ))}
                                            </Select>
                                        </Pane>
                                        {dbDescription && (
                                            <Pane textAlign='justify'>
                                                <Text
                                                  fontSize='14px'
                                                  lineHeight={ 1.5 }
                                                  color='#dedede'
                                                >
                                                    <b>Description: </b>
                                                    {dbDescription}
                                                </Text>
                                            </Pane>
                                        )}
                                    </Pane>
                                </Section>
                                <Section title='Beneficiaries and shares (optional)'>
                                    <Pane width='100%'>
                                        <Table>
                                            <Table.Head
                                              style={ {
                                                    backgroundColor: '#000',
                                                    borderBottom: '1px solid #ffffff80',
                                                } }
                                              paddingLeft='1rem'
                                            >
                                                <Table.TextHeaderCell
                                                  textAlign='start'
                                                  flexGrow={ 2 }
                                                >
                                                    <span style={ { color: '#fff' } }>Address</span>
                                                </Table.TextHeaderCell>
                                                <Table.TextHeaderCell textAlign='end' flexGrow={ 1 }>
                                                    <span style={ { color: '#fff' } }>Stake</span>
                                                </Table.TextHeaderCell>
                                                <Table.TextHeaderCell
                                                  textAlign='center'
                                                  flexGrow={ 1 }
                                                >
                                                    <span style={ { color: '#fff' } }>Share</span>
                                                </Table.TextHeaderCell>
                                                <Table.TextHeaderCell flex='none' width={ 48 } />
                                            </Table.Head>
                                            <Table.Body
                                              style={ {
                                                    backgroundColor: '#000',
                                                    overflowY: 'hidden',
                                                } }
                                            >
                                                <Table.Row
                                                  paddingLeft='1rem'
                                                  style={ { border: 0 } }
                                                    //   boxShadow='0px 0px 0.1px 0px #ddd'
                                                >
                                                    <Table.TextCell textAlign='start' flexGrow={ 2 }>
                                                        <Input
                                                          width='80%'
                                                          placeholder='Address'
                                                          className='input-green-no-focus'
                                                          value={benAddressValue}
                                                          onChange={this.benAddressValueOnChange}
                                                            // inputRef={ (node) => {
                                                            //     this.benAddress = node;
                                                            // } }
                                                        />
                                                    </Table.TextCell>
                                                    <Table.TextCell>
                                                        <Input
                                                          width='100%'
                                                          placeholder='Stake'
                                                          className='input-green-no-focus'
                                                          value={benStakeValue}
                                                            // inputRef={ (node) => {
                                                            //     this.benStake = node;
                                                            // } }
                                                          onChange={ this.onStakeChange }
                                                        />
                                                    </Table.TextCell>
                                                    <Table.TextCell textAlign='center' flexGrow={ 1 }>
                                                        <span style={ { color: '#fff' } }>0%</span>
                                                    </Table.TextCell>
                                                    <Table.TextCell flex='none' width={ 48 }>
                                                        <IconButton
                                                          icon='add'
                                                          appearance='minimal'
                                                          className='icon-btn color-white-svg'
                                                          onClick={ this.addBeneficiary }
                                                        />
                                                    </Table.TextCell>
                                                </Table.Row>

                                                <Pane>{beneficiariesRows}</Pane>
                                            </Table.Body>
                                        </Table>
                                    </Pane>
                                </Section>
                            </Pane>
                        )}

                        {tab === 'output' && (
                            <Pane
                              maxHeight={ 560 }
                              height='60vh'
                              paddingLeft='2rem'
                              paddingRight='0.1rem'
                              paddingY='1.5rem'
                              borderRadius={ 4 }
                              boxShadow='0px 0px 10px #36d6ae'
                              marginBottom='2rem'
                            >
                                <Pane overflow='auto' height='100%'>
                                    <Code>{DatabaseSource}</Code>
                                </Pane>
                            </Pane>
                        )}

                        {type === 'error' && message && (
                            <Message style={ { position: 'sticky', bottom: '12%' } } type='error'>
                                {message}
                            </Message>
                        )}

                        {/* <StatusBar
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
                </FlexContainer> */}
                    </MainContainer>
                </ScrollContainer>
                <FooterCyb />
            </span>
        );
    }
}

export default NewDatabase;
