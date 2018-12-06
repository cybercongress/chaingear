import React, { Component } from 'react';
import { browserHistory } from 'react-router';

import {
    ActionLink, LinkHash,
    MainContainer,
    AddItemButton,
    AddItemButtonText,

    Section,
    SectionContent,

    Centred,

    Button,

    FundContainer,
    BoxTitle,
    StatusBar,
} from '@cybercongress/ui';

import * as cyber from '../../utils/cyber';
import TransferForm from './TransferForm';
import { RegistryItem, RegistryList } from './RegistryItem';
import ValueInput from '../../components/ValueInput';
import FormField from './FormField';

import Registry from '../../../../build/contracts/Registry.json';

const moment = require('moment');

class Register extends Component {
    state = {
        items: [],
        fields: [],
        loading: false,
        isOwner: false,
        totalFee: 0,
        funded: '',

        registryContract: null,
        web3: null,

        name: '',
        description: '',
        tag: '',
        registrationTimestamp: null,
        entryCreationFee: 0,
        admin: '',
        userAccount: null,
        abi: [],

        contractVersion: null,
        registryAddress: null,
        registryId: null,
        entryCoreAddress: null,
        entryCoreContract: null,
        ipfsHash: null,
        isSchemaExist: false,
    };

    componentDidMount() {
        this.setState({
            loading: true,
        });

        const registryId = this.props.params.id;

        let _registryAddress = null;
        let _registries = null;
        let _userAccount = null;
        let _web3 = null;
        let _registryContract = null;
        let _registry = null;
        let _registryId = registryId;
        let _chaingearContract = null;
        let _abi = null;
        let _fields = null;
        let _entryCoreAddress = null;
        let _entryCoreContract = null;

        let _newState = {};
        cyber.init()
            .then(({ contract, web3 }) => {
                _web3 = web3;
                _chaingearContract = contract;
            })
            .then(() => cyber.getDefaultAccount())
            .then((defaultAccount) => {
                _userAccount = defaultAccount;
            })
            .then(() => cyber.callContractMethod(_chaingearContract, 'readRegistry', _registryId))
            .then((registry) => {
                _registry = cyber.mapRegistry(registry);
                _registryAddress = _registry.address;
                _registryContract = _web3.eth.contract(Registry.abi).at(_registryAddress);
            })
            .then(() => {
                const fundedPromise = cyber.callContractMethod(_chaingearContract, 'readRegistryBalance', _registryId);
                const totalFeePromise = cyber.callWeb3EthMethod(_web3, 'getBalance', _registryAddress);
                const ownerPromise = cyber.callContractMethod(_registryContract, 'getAdmin');
                const descriptionPromise = cyber.callContractMethod(_registryContract, 'getRegistryDescription');
                const symbolPromise = cyber.callContractMethod(_registryContract, 'symbol');
                const entryCreationFeePromise = cyber.callContractMethod(_registryContract, 'getEntryCreationFee');

                return Promise
                    .all([fundedPromise, totalFeePromise, ownerPromise, descriptionPromise, symbolPromise, entryCreationFeePromise]);
            })
            .then(([funded, totalFee, owner, description, symbol, entryCreationFee]) => {

                const _funded = _web3.fromWei(_web3.toDecimal(funded[0].toNumber()));
                const _entryCreationFee = _web3.fromWei(entryCreationFee, 'ether').toNumber();
                const _totalFee = _web3.fromWei(_web3.toDecimal(totalFee), 'ether');

                _newState = {
                    ..._newState,
                    ...{
                        name: _registry.name,
                        registrationTimestamp: _registry.registrationTimestamp,
                        admin: _registry.admin,
                        contractVersion: _registry.contractVersion,
                        tag: '',
                        web3: _web3,
                        registries: _registries,
                        registryAddress: _registryAddress,
                        registryContract: _registryContract,
                        funded: _funded,
                        totalFee: _totalFee,
                        userAccount: _userAccount,
                        isOwner: _userAccount === owner,
                        owner,
                        description,
                        symbol,
                        entryCreationFee: _entryCreationFee,
                    },
                };
            })
            .then(() => cyber.callContractMethod(_registryContract, 'getRegistryInitStatus'))
            .then((isSchemaExist) => {
                if (!isSchemaExist) {
                    this.setState({
                        ..._newState,
                        isSchemaExist,
                        registryId: _registryId,
                        loading: false,
                    });
                    throw new Error('Schema is not exist');
                } else {
                    _newState = {
                        ..._newState,
                        isSchemaExist,
                        registryId: _registryId,
                    };
                }
            })
            //
            //
            // with schema
            //
            //
            .then(() => cyber.callContractMethod(_registryContract, 'getEntriesStorage'))
            .then((entryAddress) => {
                _entryCoreAddress = entryAddress;
            })
            .then(() => cyber.callContractMethod(_registryContract, 'getInterfaceEntriesContract'))
            .then(ipfsHash => cyber.getRegistryFieldsByHash(ipfsHash))
            .then(({ ipfsHash, abi, fields }) => {
                _abi = abi;
                _fields = fields;
                _entryCoreContract = _web3.eth.contract(abi).at(_entryCoreAddress);


                _newState = {
                    ..._newState,
                    ...{
                        ipfsHash,
                        fields,
                        abi,
                    },
                };
            })
            .then(() => this.setState({
                registryContract: _registryContract,
                entryCoreContract: _entryCoreContract,
                fields: _fields,
                abi: _abi,
                web3: _web3,
            }))
            .then(() => this.getRegistryItems())
            .then((items) => {
                _newState = {
                    ..._newState,
                    ...{
                        items,
                        entriesAmount: items.length,
                        loading: false,
                    },
                };
            })
            .then(() => {
                this.setState(_newState);
            })
            .catch((error) => {
                console.log(`Cannot load registry data. Error: ${error}`);
            });
    }

    getRegistryItems = () => {
        const { registryContract: contract, fields, abi, web3 } = this.state;

        return new Promise((topResolve, reject) => {

            cyber.getRegistryData(contract, fields, abi)
                .then(({ items, fields, entryAddress }) => {
                    return Promise.all([
                        entryAddress,
                        items,
                        ...items.map(item => new Promise((resolve) => {
                            cyber.callContractMethod(contract, 'readEntryMeta', item.__index)
                                .then(data => resolve(data));
                        })),
                    ]);
                })
                .then(([entryAddress, items, ...data]) => {
                    const _items = items.map((item, index) => {
                        const currentEntryBalanceETH = web3.fromWei(data[index][4]).toNumber();
                        const owner = data[index][0];

                        return {
                            ...item,
                            currentEntryBalanceETH,
                            owner,
                            id: item.__index,
                        };
                    });

                    topResolve(_items);
                });
        });

    };

    add = (values) => {
        const { registryContract } = this.state;

        if (!registryContract) {
            return;
        }

        cyber.callContractMethod(registryContract, 'getEntryCreationFee')
            .then((fee) => {
                return fee.toNumber();
            })
            .then((fee) => {
                return cyber.callContractMethod(registryContract, 'createEntry', { value: fee });
            })
            .then((entryId) => {
                console.log(`New Entry created: ${entryId}`);
                this.setState({
                    loading: true,
                });
                return cyber.eventPromise(registryContract.EntryCreated());
            })
            .then(() => this.componentDidMount())
            .catch(() => {
                console.log(`Cannot add entry to ${registryContract.name}`);
            });
    };

    onUpdate = (values, entryId) => {
        const { entryCoreContract } = this.state;

        this.setLoading(true);

        cyber.callContractMethod(entryCoreContract, 'updateEntry', entryId, ...values)
            .then(() => cyber.eventPromise(entryCoreContract.EntryUpdated()))
            .then(() => this.getRegistryItems())
            .then(items => this.setState({
                items,
                loading: false,
            }));
    };

    removeItemClick = (id) => {
        const { registryContract } = this.state;

        this.setLoading(true);
        cyber.callContractMethod(registryContract, 'deleteEntry', id)
            .then(() => cyber.eventPromise(registryContract.EntryDeleted()))
            .then(() => this.getRegistryItems())
            .then(items => this.setState({
                items,
                loading: false,
            }));
    };


    validate = (e) => {
        e.preventDefault();
        console.log(e.target.value);
    }

    claim = () => {
        this.contract.claim((e, d) => {
            this.setState({ balance: 0 });
        });
    }

    removeContract = () => {
        const address = this.props.params.adress;

        cyber.removeRegistry(address).then(() => {
            this.contract.destroy((e, d) => {
                browserHistory.push('/');
            });
        });
    }

    fundEntryClick = (index, value) => {
        this.setState({ loading: true });
        const address = this.props.params.adress;

        cyber.fundEntry(address, index, value)
            .then(() => {
                this.setState({ loading: false });
            });
    }

    changeName = (name) => {
        alert('TODO');
    }

    changeDescription = (description) => {
        this.state.registryContract.updateRegistryDescription(description, (e, data) => {
            this.setState({
                description,
            });
        });
    }

    changeTag = (tag) => {
        this.state.registryContract.addRegistryTag(tag, () => {
            this.setState({
                tag,
            });
        });
    }

    changeEntryCreationFee = (newFee) => {
        const { registryContract, web3 } = this.state;
        const fee = web3.toWei(newFee, 'ether');

        this.setLoading(true);
        cyber.callContractMethod(registryContract, 'updateEntryCreationFee', fee)
            //.then(() => cyber.eventPromise(registryContract.feeUpdated()))
            .then(() => this.setState({
                entryCreationFee: newFee,
                loading: false,
            }));
    };

    clameRecord = (entryID, amount) => {
        this.state.registryContract.claimEntryFunds(entryID, this.state.web3.toWei(amount, 'ether'), (e, data) => {
            this.componentDidMount();
        });
    }

    setLoading = (value) => {
        this.setState({
            loading: value,
        });
    };

    fundRegistry = (amount) => {
        const { registryAddress, web3 } = this.state;
        let _chaingerContract;

        this.setLoading(true);

        cyber.getChaingearContract()
            .then(({ contract }) => {
                _chaingerContract = contract;
            })
            .then(() => cyber.callContractMethod(_chaingerContract, 'getRegistryIdByAddress', registryAddress))
            .then(registryID => cyber.callContractMethod(_chaingerContract, 'fundRegistry', registryID, {
                value: web3.toWei(amount, 'ether'),
            }))
            .then(() => cyber.eventPromise(_chaingerContract.RegistryFunded()))
            .then(() => this.componentDidMount());
    };

    clameRegistry = (amount) => {
        const registryID = this.getRegistryID();

        cyber.getChaingearContract().then(({ contract, web3 }) => {
            contract.claimRegistryFunds(registryID, web3.toWei(amount, 'ether'), (e, data) => {
                this.componentDidMount();
            });
        });
    }

    clameFee = (amount) => {
        this.state.registryContract.claim((e, data) => {

        });
    }

    transferRegistry = (userAccount, newOwner) => {
        const registryID = this.getRegistryID();

        cyber.getChaingearContract().then(({ contract, web3 }) => {
            contract.transferFrom(userAccount, newOwner, registryID, (e, data) => {
                this.componentDidMount();
            });
        });
    }

    transferItem = (userAccount, newOwner, entryID) => {
        this.state.registryContract.transferFrom(userAccount, newOwner, entryID, (e, data) => {
            this.componentDidMount();
        });
    }

    render() {
        const {
            fields, items, loading, isOwner, userAccount, isSchemaExist, registryId,
        } = this.state;


        const rows = items.map((item, index) => (
            <RegistryItem
                clameRecord={ this.clameRecord }
                removeItemClick={ this.removeItemClick }
                fundEntryClick={ this.fundEntryClick }
                userAccount={ userAccount }
                onUpdate={ values => this.onUpdate(values, index) }
                onTransfer={ newOwner => this.transferItem(userAccount, newOwner, index) }
                fields={ fields }
                item={ item }
                index={ index }
                key={ index }
            />
        ));

        const {
            name,
            description,
            registrationTimestamp,
            entryCreationFee,
            admin,
            totalFee,
            funded,
            tag,
            symbol,
            owner,
            contractVersion,
            registryAddress,
            entryCoreAddress,
            ipfsHash,
        } = this.state;

        return (
            <div>
                <StatusBar
                    open={ loading }
                    message='loading...'
                />
                <MainContainer>
                    <Section>
                        <div style={ { marginLeft: '15px' } }>
                            <ActionLink to='/'>BACK TO CHAINGEAR</ActionLink>
                            {!isSchemaExist &&
                                <ActionLink to={`/schema/${registryId}`}>Define schema</ActionLink>
                            }
                        </div>
                    </Section>
                    <Section title='General'>
                        <SectionContent style={ { width: '25%' } }>
                            <Centred>
                                <BoxTitle>
                                    Created:
                                </BoxTitle>
                                <div style={ { height: 100, color: '#000000' } }>
                                    {registrationTimestamp ? moment(new Date(registrationTimestamp.toNumber() * 1000)).format('DD/MM/YYYY mm:hh:ss') : ''}
                                </div>
                            </Centred>
                        </SectionContent>

                        <SectionContent style={ { width: '25%' } }>
                            <Centred>
                                <BoxTitle>Admin:</BoxTitle>
                                <div style={ { height: 100 } }>
                                    <LinkHash value={ admin } />
                                </div>
                            </Centred>
                        </SectionContent>

                        <SectionContent style={ { width: '25%' } }>
                            <Centred>
                                <BoxTitle>
                                    FUNDED:
                                </BoxTitle>

                                <FundContainer
                                    style={ { height: 100, justifyContent: isOwner ? 'space-around' : 'start' } }
                                >
                                    <span>
                                        {funded}
                                        {' '}
                                        ETH
                                    </span>

                                    {isOwner && (
                                        <ValueInput
                                            onInter={ this.clameRegistry }
                                            buttonLable='claim funds'
                                            color='second'
                                        />
                                    )}

                                </FundContainer>
                            </Centred>
                        </SectionContent>

                        <SectionContent style={ { width: '25%' } }>
                            <Centred>
                                <BoxTitle>
                                    FEES:
                                </BoxTitle>

                                <FundContainer
                                    style={ { height: 100, justifyContent: isOwner ? 'space-around' : 'start' } }
                                >
                                    <span>
                                        {totalFee}
                                        {' '}
                                        ETH
                                    </span>
                                    {isOwner && <Button style={ { width: 119 } } onClick={ this.clameFee }>clame fee</Button>}
                                </FundContainer>

                            </Centred>
                        </SectionContent>

                    </Section>

                    <Section title='Overview'>
                        <SectionContent grow={ 0 } style={ { width: '25%' } }>
                            <Centred>
                                <div>
                                    {/* <QRCode hash={address} size={160} /> */}
                                    <TransferForm
                                        height={ 140 }
                                        address={ owner }
                                        isOwner={ isOwner }
                                        onTransfer={ newOwner => this.transferRegistry(userAccount, newOwner) }
                                    />
                                </div>
                                <ValueInput
                                    onInter={ this.fundRegistry }
                                    buttonLable='fund registry'
                                    width='100%'
                                />
                            </Centred>
                        </SectionContent>

                        <SectionContent grow={ 3 }>
                            <FormField
                                label='Name'
                                value={ name }
                            />
                            <FormField
                                label='Symbol'
                                value={ symbol }
                            />
                            <FormField
                                label='Fee'
                                value={ entryCreationFee.toString() }
                                valueType='ETH'
                                onUpdate={ isOwner && this.changeEntryCreationFee }
                            />
                            <FormField
                                label='Description'
                                value={ description }
                                onUpdate={ isOwner && this.changeDescription }
                            />
                            <FormField
                                label='Tags'
                                value={ tag }
                            />
                            <FormField
                                label='Entries'
                                value={ rows.length }
                            />
                            <FormField
                                label='Registry Type'
                                value={ contractVersion }
                            />
                            <FormField
                                label='Registry address'
                                value={ registryAddress }
                            />
                            <FormField
                                label='Entry Core address'
                                value={ entryCoreAddress }
                            />
                            <FormField
                                label='LINK TO ABI'
                                value={ (
                                  <a
                                      href={ `http://localhost:8080/ipfs/${ipfsHash}` }
                                      target='_blank'
                                    >{ipfsHash}
                                    </a>
                                ) }
                            />
                        </SectionContent>
                    </Section>


                    <RegistryList>
                        {rows}
                    </RegistryList>

                </MainContainer>
                {isOwner && isSchemaExist && (
                    <AddItemButton onClick={ this.add }>
                        <AddItemButtonText>Add Record</AddItemButtonText>
                        <span>
                            Fee:
                            {entryCreationFee}
                            {' '}
                            ETH
                        </span>
                    </AddItemButton>
                )}
            </div>
        );
    }
}


export default Register;
