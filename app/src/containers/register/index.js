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
        registries: [],
        newItem: {},
        loading: false,
        balance: null,
        isOwner: false,
        totalFee: 0,
        funded: '???',

        registryContract: null,
        web3: null,

        name: '',
        description: '',
        tag: '',
        registrationTimestamp: null,
        entryCreationFee: 0,
        entriesAmount: 0,
        admin: '',
        userAccount: null,

        contractVersion: null,
        registryAddress: null,
        entryCoreAddress: null,
        ipfsHash: null,
    }

    componentDidMount() {
        this.setState({
            loading: true,
        });

        const registryAddress = this.props.params.adress;

        let _registries = null;
        let _userAccount = null;
        let _web3 = null;
        let _registryContract = null;
        let _registry = null;
        let _registryId = null;
        let _chaingearContract = null;
        let _abi = null;
        let _fields = null;
        let _ipfsHash = null;

        let _newState = {};
        cyber.init()
            .then(({ contract, web3 }) => {
                _web3 = web3;
                _chaingearContract = contract;
            })
            .then(() => {
                cyber.getDefaultAccount();
            })
            .then((defaultAccount) => {
                _userAccount = defaultAccount;
            })
            .then(() => cyber.callContractMethod(_chaingearContract, 'getRegistryIdByAddress', registryAddress))
            .then((registryId) => {
                _registryId = registryId;
            })
            .then(() => {
                _registryContract = _web3.eth.contract(Registry.abi).at(registryAddress);
            })
            .then(() => cyber.callContractMethod(_chaingearContract, 'readRegistry', _registryId))
            .then((registry) => {
                _registry = this.mapRegistry(registry);
            })
            .then(() => {
                const fundedPromise = cyber.callContractMethod(_chaingearContract, 'readRegistryBalance', _registryId);
                const totalFeePromise = cyber.callWeb3EthMethod(_web3, 'getBalance', registryAddress);
                const ownerPromise = cyber.callContractMethod(_registryContract, 'getAdmin');
                const descriptionPromise = cyber.callContractMethod(_registryContract, 'getRegistryDescription');
                const symbolPromise = cyber.callContractMethod(_registryContract, 'symbol');
                const entryCreationFeePromise = cyber.callContractMethod(_registryContract, 'getEntryCreationFee');

                const registryDataPromise = cyber.callContractMethod(_registryContract, 'getInterfaceEntriesContract')
                    .then((ipfsHash) => {
                        return cyber.getRegistryFieldsByHash(ipfsHash);
                    }).then(({ ipfsHash, abi, fields }) => ({
                        ipfsHash,
                        abi,
                        fields,
                    }));

                return Promise
                    .all([fundedPromise, totalFeePromise, ownerPromise, descriptionPromise, symbolPromise, entryCreationFeePromise, registryDataPromise]);
            })
            .then(([funded, totalFee, owner, description, symbol, entryCreationFee, registryData]) => {

                const _funded = _web3.fromWei(_web3.toDecimal(funded[0].toNumber()));
                const _entryCreationFee = _web3.fromWei(entryCreationFee, 'ether').toNumber();
                const _totalFee = _web3.fromWei(_web3.toDecimal(totalFee), 'ether');

                _ipfsHash = registryData.ipfsHash;
                _fields = registryData.fields;
                _abi = registryData.abi;

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
                        registryAddress,
                        registryContract: _registryContract,
                        funded: _funded,
                        totalFee: _totalFee,
                        userAccount: _userAccount,
                        isOwner: _userAccount === owner,
                        owner,
                        description,
                        symbol,
                        entryCreationFee: _entryCreationFee,
                        ipfsHash: _ipfsHash,
                        fields: _fields,
                    },
                };
            })
            .then(() => cyber.getRegistryData(_registryContract, _fields, _abi))
            .then(({ items, fields, entryAddress }) => {
                return Promise.all([
                    entryAddress,
                    items,
                    ...items.map(item => new Promise((resolve) => {
                        _registryContract.readEntryMeta(item.__index, (e, data) => resolve(data));
                    })),
                ]);
            })
            .then(([entryAddress, items, ...data]) => {
                const _items = items.map((item, index) => {
                    const currentEntryBalanceETH = _web3.fromWei(data[index][4]).toNumber();
                    const owner = data[index][0];

                    return {
                        ...item,
                        currentEntryBalanceETH,
                        owner,
                        id: item.__index,
                    };
                });

                _newState = {
                    ..._newState,
                    ...{
                        entryCoreAddress: entryAddress,
                        items: _items,
                        entriesAmount: items.length,
                        loading: false,
                    },
                };
            })
            .then(() => {
                this.setState(_newState);
            });
    }

    mapRegistry = rawRegistry => ({
        name: rawRegistry[0],
        symbol: rawRegistry[1],
        address: rawRegistry[2],
        contractVersion: rawRegistry[3],
        registrationTimestamp: rawRegistry[4],
        ipfsHash: '',
        admin: rawRegistry[5],
        supply: rawRegistry[6],
    });

    deleted = (e, result) => {
        const index = result.args.entryId.toNumber();

        this.setState({
            items: this.state.items.filter((x, i) => i !== index),
            loading: false,
        });
    }


    add = (values) => {
        // cyber.addRegistryItem(this.contract, args);
        const { registries } = this.state;
        const address = this.props.params.adress;
        const registry = registries.find(x => x.address === address);

        if (!registry) {
            return;
        }
        const r = cyber.getRegistryContract(registry.address);

        r.getInterfaceEntriesContract((e, ipfsHash) => {
            // const ipfsHash = registry.ipfsHash;
            cyber.addItem(address)
                .then((entryId) => {
                    this.componentDidMount();
                    // return cyber.updateItem(address, ipfsHash, entryId, values)
                });
        });
    }

    onUpdate = (values, entryId) => {
        const { registries } = this.state;
        const address = this.props.params.adress;
        const registry = registries.find(x => x.address === address);

        if (!registry) {
            return;
        }
        const r = cyber.getRegistryContract(registry.address);

        r.getInterfaceEntriesContract((e, ipfsHash) => {
            // const ipfsHash = registry.ipfsHash;
            cyber.updateItem(address, ipfsHash, entryId, values)
                .then((entryId) => {
                    this.componentDidMount();
                    // return cyber.updateItem(address, ipfsHash, entryId, values)
                });
        });
    }

    removeItemClick = (id) => {
        this.setState({ loading: true });
        const address = this.props.params.adress;

        cyber.removeItem(address, id)
            .then(() => {
                const newItems = this.state.items.filter((item, index) => index !== id);

                this.setState({ items: newItems, loading: false });
            });
        // alert(id)
        // this.contract.deleteEntry(id, function(e, r){

        // });
        // this.setState({
        //   loading: true
        // })
    }


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

    changeEntryCreationFee = (entryCreationFee) => {
        const address = this.props.params.adress;

        cyber.updateEntryCreationFee(address, entryCreationFee);
    }

    clameRecord = (entryID, amount) => {
        this.state.registryContract.claimEntryFunds(entryID, this.state.web3.toWei(amount, 'ether'), (e, data) => {
            this.componentDidMount();
        });
    }

    getRegistryID = (registries) => {
        const address = this.props.params.adress;

        let index = null;

        (registries || this.state.registries).forEach((reg, _index) => {
            if (reg.address === address) {
                index = _index;
            }
        });

        return index;
    }

    fundRegistry = (amount) => {
        const registryID = this.getRegistryID();
        // alert(registryID);

        cyber.getChaingearContract().then(({ contract, web3 }) => {
            contract.fundRegistry(registryID, { value: web3.toWei(amount, 'ether') }, (e, data) => {
                this.componentDidMount();
            });
        });
    }

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
            fields, items, loading, isOwner, userAccount,
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
        const address = this.props.params.adress;

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
                {isOwner && (
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
