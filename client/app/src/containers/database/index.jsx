import React, { Component } from 'react';

import {
    ActionLink,
    LinkHash,
    MainContainer,
    // AddItemButton,
    // AddItemButtonText,
    Section,
    SectionContent,
    Centred,
    Button,
    FundContainer,
    BoxTitle,
    StatusBar,
    DbHeader, DbHeaderLeft, DbHeaderRight, DbHeaderLine, DbHeaderName,
    DbMenu,
    MenuPopup, MenuPopupItem, MenuSeparator, MenuPopupDeleteIcon, MenuPopupEditIcon,
    Popup, PopupContent, PopupFooter, PopupTitle,
    BenContainer, BenPieChart, BenList, Ben,
} from '@cybercongress/ui';

import * as cyber from '../../utils/cyber';
import TransferForm from './TransferForm';
import { DatabaseItem, DatabaseList } from './DatabaseItem';
import ValueInput from '../../components/ValueInput';
import FormField from './FormField';

import DatabaseV1 from '../../../../../build/contracts/DatabaseV1.json';

const moment = require('moment');

const Permission = {
    OnlyAdmin: 0,
    Whitelist: 1,
    AllUsers: 2,
};

const CreateEntryPermissionGroup = {
    [Permission.OnlyAdmin]: {
        key: 'OnlyAdmin',
        label: 'ONLY OWNER',
    },
    // 1: {
    //     key: 'Whitelist',
    //     label: 'Whitelist',
    // },
    [Permission.AllUsers]: {
        key: 'AllUsers',
        label: 'All Users',
    },
};

let _databaseContract = null;

class Database extends Component {
    state = {
        items: [],
        fields: [],
        loading: false,
        isOwner: false,
        totalFee: 0,
        funded: '',

        beneficiaries: [],
        databaseContract: null,
        web3: null,
        ipfsGateway: null,

        name: '',
        description: '',
        tag: '',
        createdTimestamp: null,
        entryCreationFee: 0,
        admin: '',
        userAccount: null,
        abi: [],
        isDbPaused: null,
        duplicateFieldFound: false,
        duplicateFieldId: null,

        contractVersion: null,
        databaseAddress: null,
        databaseSymbol: null,
        databaseId: null,
        entryCoreAddress: null,
        entryCoreContract: null,
        ipfsHash: null,
        isSchemaExist: false,

        claimFundOpen: false,

        permissionGroup: 0,
    };

    componentDidMount() {
        this.setState({
            loading: true,
        });

        const databaseSymbol = this.props.params.dbsymbol;

        let _databaseAddress = null;
        let _databases = null;
        let _userAccount = null;
        let _web3 = null;
        let _database = null;
        let _databaseId = null;
        let _chaingearContract = null;
        let _abi = null;
        let _fields = null;
        let _entryCoreAddress = null;
        let _entryCoreContract = null;
        let _isDbPaused = null;
        let _ipfsGateway = null;
        let _beneficiaries = null;
        let _permissionGroup = 0;

        let _newState = {};
        cyber.init()
            .then(({ contract, web3 }) => {
                _web3 = web3;
                _chaingearContract = contract;
            })
            .then(() => cyber.getIpfsGateway())
            .then((ipfsGateway) => {
                _ipfsGateway = ipfsGateway;
            })
            .then(() => cyber.getDefaultAccount())
            .then((defaultAccount) => {
                _userAccount = defaultAccount;
            })
            .then(() => cyber.callContractMethod(_chaingearContract, 'getDatabaseIDBySymbol', databaseSymbol))
            .then((databaseId) => {
                _databaseId = databaseId;
            })
            .then(() => cyber.callContractMethod(_chaingearContract, 'getDatabase', _databaseId))
            .then((database) => {
                _database = cyber.mapDatabase(database);
                _databaseAddress = _database.address;
                _databaseContract = _web3.eth.contract(DatabaseV1.abi).at(_databaseAddress);
            })
            .then(() => cyber.getBeneficiaries(_databaseContract))
            .then((beneficiaries) => {
                _beneficiaries = beneficiaries;
            })
            .then(() => cyber.callContractMethod(_databaseContract, 'paused'))
            .then((isDbPaused) => {
                _isDbPaused = isDbPaused;
            })
            .then(() => cyber.callContractMethod(_databaseContract, 'getRegistryPermissions'))
            .then((permissionGroup) => {
                _permissionGroup = permissionGroup.toNumber();
            })
            .then(() => {
                const fundedPromise = cyber.callContractMethod(_chaingearContract, 'getDatabaseBalance', _databaseId);
                const totalFeePromise = cyber.callWeb3EthMethod(_web3, 'getBalance', _databaseAddress);
                const ownerPromise = cyber.callContractMethod(_databaseContract, 'getAdmin');
                const descriptionPromise = cyber.callContractMethod(_databaseContract, 'getDatabaseDescription');
                const entryCreationFeePromise = cyber.callContractMethod(_databaseContract, 'getEntryCreationFee');

                return Promise
                    .all([fundedPromise, totalFeePromise, ownerPromise, descriptionPromise, entryCreationFeePromise]);
            })
            .then(([funded, totalFee, owner, description, entryCreationFee]) => {

                const _funded = _web3.fromWei(_web3.toDecimal(funded[0].toNumber()));
                const _entryCreationFee = _web3.fromWei(entryCreationFee, 'ether').toNumber();
                const _totalFee = _web3.fromWei(_web3.toDecimal(totalFee), 'ether');

                _newState = {
                    ..._newState,
                    ...{
                        name: _database.name,
                        createdTimestamp: _database.createdTimestamp,
                        admin: _database.admin,
                        contractVersion: _database.contractVersion,
                        tag: '',
                        web3: _web3,
                        databases: _databases,
                        databaseAddress: _databaseAddress,
                        databaseContract: _databaseContract,
                        funded: _funded,
                        totalFee: _totalFee,
                        userAccount: _userAccount,
                        isOwner: _userAccount === owner,
                        owner,
                        description,
                        databaseSymbol,
                        entryCreationFee: _entryCreationFee,
                        isDbPaused: _isDbPaused,
                        ipfsGateway: _ipfsGateway,
                        beneficiaries: _beneficiaries,
                        permissionGroup: _permissionGroup,
                    },
                };
            })
            .then(() => cyber.callContractMethod(_databaseContract, 'getDatabaseInitStatus'))
            .then((isSchemaExist) => {
                if (!isSchemaExist) {
                    this.setState({
                        ..._newState,
                        isSchemaExist,
                        databaseId: _databaseId,
                        loading: false,
                    });
                    throw new Error('Schema is not exist');
                } else {
                    _newState = {
                        ..._newState,
                        isSchemaExist,
                        databaseId: _databaseId,
                    };
                }
            })
            //
            //
            // with schema
            //
            //
            .then(() => cyber.callContractMethod(_databaseContract, 'getEntriesStorage'))
            .then((entryAddress) => {
                _entryCoreAddress = entryAddress;
            })
            .then(() => cyber.callContractMethod(_databaseContract, 'getInterfaceEntriesContract'))
            .then(ipfsHash => cyber.getDatabaseFieldsByHash(ipfsHash))
            .then(({ ipfsHash, abi, fields }) => {
                _abi = abi;
                _fields = fields;
                _entryCoreContract = _web3.eth.contract(abi).at(_entryCoreAddress);


                _newState = {
                    ..._newState,
                    ...{
                        ipfsHash,
                        abi,
                        entryCoreAddress: _entryCoreAddress,
                    },
                };
            })
            .then(() => this.getUniqValidationStatuses(_fields, _entryCoreContract))
            .then((uniqueStatuses) => {
                _fields = _fields.map((field, index) => ({
                    ...field,
                    unique: uniqueStatuses[index],
                }));
            })
            .then(() => this.setState({
                databaseContract: _databaseContract,
                entryCoreContract: _entryCoreContract,
                fields: _fields,
                abi: _abi,
                web3: _web3,
            }))
            .then(() => this.getDatabaseItems())
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
                console.log(`Cannot load database data. Error: ${error}`);
            });
    }

    getUniqValidationStatuses = (fields, entryCoreContract) => {
        return Promise.all(
            fields.map((field, index) => cyber.callContractMethod(entryCoreContract, 'getUniqStatus', index)),
        );
    };

    getDatabaseItems = () => {
        const { databaseContract: contract, fields, abi, web3 } = this.state;

        return new Promise((topResolve, reject) => {

            cyber.getDatabaseData(contract, fields, abi)
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

    add = () => {
        const { databaseContract, name } = this.state;

        if (!databaseContract) {
            return;
        }

        cyber.callContractMethod(databaseContract, 'getEntryCreationFee')
            .then(fee => fee.toNumber())
            .then(fee => cyber.callContractMethod(databaseContract, 'createEntry', { value: fee }))
            .then((entryId) => {
                console.log(`New Entry created: ${entryId}`);
                this.setState({
                    loading: true,
                });
                return cyber.eventPromise(databaseContract.EntryCreated());
            })
            .then(() => this.componentDidMount())
            .catch(() => {
                console.log(`Cannot add entry to ${name}`);
            });
    };

    checkUnique = (values, entryId) => {
        const { items, fields } = this.state;

        const uniqueFieldsIndexes = fields
            .map((field, index) => ({
                ...field,
                index,
            }))
            .filter(field => field.unique)
            .map(field => field.index);

        if (uniqueFieldsIndexes.length === 0) {
            return true;
        }

        let duplicateFound = false;
        items.forEach((item) => {

            if (!duplicateFound) {
                uniqueFieldsIndexes.forEach((index) => {

                    //console.log(item[fields[index].name], ' === ',values[index], ' ', item.id, ' === ', entryId);

                    if (item[fields[index].name].toString() === values[index].toString() && item.id !== entryId) {
                        duplicateFound = true;
                    }
                });
            }
        });

        return !duplicateFound;
    };

    onUpdate = (values, entryId) => {
        const { entryCoreContract } = this.state;

        if (!this.checkUnique(values, entryId)) {
            this.setState({
                duplicateFieldFound: true,
                duplicateFieldId: entryId,
            });
            return;
        }

        this.setLoading(true);

        cyber.callContractMethod(entryCoreContract, 'updateEntry', entryId, ...values)
            .then(() => cyber.eventPromise(entryCoreContract.EntryUpdated()))
            .then(() => this.getDatabaseItems())
            .then(items => this.setState({
                items,
                loading: false,
            }))
            .catch(() => this.setLoading(false));
    };

    removeItemClick = (id) => {
        const { databaseContract } = this.state;

        this.setLoading(true);
        cyber.callContractMethod(databaseContract, 'deleteEntry', id)
            .then(() => cyber.eventPromise(databaseContract.EntryDeleted()))
            .then(() => this.getDatabaseItems())
            .then(items => this.setState({
                items,
                loading: false,
            }))
            .catch(() => this.setLoading(false));
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

    fundEntryClick = (id, value) => {
        this.setState({ loading: true });

        const { databaseContract, web3 } = this.state;

        cyber.callContractMethod(databaseContract, 'fundEntry', id, {
            value: web3.toWei(value, 'ether'),
        })
            .then((data) => {
                console.log(`Entry ${id} funded. ETH: ${value}. Data: ${data}`);
            })
            .then(() => cyber.eventPromise(databaseContract.EntryFunded()))
            .then(results => console.log(`Entry ${id} funded. Results: ${results}`))
            .then(() => this.getDatabaseItems())
            .then((items) => {
                this.setState({
                    items,
                    loading: false,
                });
            })
            .catch(() => this.setLoading(false));
    };

    changeDescription = (description) => {
        const { databaseContract } = this.state;

        this.setLoading(true);

        cyber.callContractMethod(databaseContract, 'updateDatabaseDescription', description)
            .then(data => console.log(`Description change. Tx:${data}`))
            .then(() => cyber.eventPromise(databaseContract.DescriptionUpdated()))
            .then(results => console.log(`Description changed. Results: ${results}`))
            .then(() => this.componentDidMount())
            .catch(() => this.setLoading(false));
    };

    changeTag = (tag) => {
        this.state.databaseContract.addDatabaseTag(tag, () => {
            this.setState({
                tag,
            });
        });
    }

    changeEntryCreationFee = (newFee) => {
        const { databaseContract, web3 } = this.state;
        const fee = web3.toWei(newFee, 'ether');

        this.setLoading(true);
        cyber.callContractMethod(databaseContract, 'updateEntryCreationFee', fee)
            .then(data => console.log(`Update entry creation fee. Data: ${data}`))
            .then(() => cyber.eventPromise(databaseContract.EntryCreationFeeUpdated()))
            .then(results => console.log(`Update entry creation fee. Results: ${results}`))
            .then(() => this.setState({
                entryCreationFee: newFee,
                loading: false,
            }))
            .catch(() => this.setLoading(false));
    };

    clameRecord = (entryID, amount) => {
        this.state.databaseContract.claimEntryFunds(entryID, this.state.web3.toWei(amount, 'ether'), (e, data) => {
            this.componentDidMount();
        });
    }

    setLoading = (value) => {
        this.setState({
            loading: value,
        });
    };

    fundDatabase = (amount) => {
        const { databaseId, web3 } = this.state;
        let _chaingerContract;

        this.setLoading(true);

        cyber.getChaingearContract()
            .then(({ contract }) => {
                _chaingerContract = contract;
            })
            .then(() => cyber.callContractMethod(_chaingerContract, 'fundDatabase', databaseId, {
                value: web3.toWei(amount, 'ether'),
            }))
            .then(() => cyber.eventPromise(_chaingerContract.DatabaseFunded()))
            .then(() => this.componentDidMount());
    };

    claimDatabase = (amount) => {
        const { databaseId } = this.state;

        cyber.getChaingearContract().then(({ contract, web3 }) => {
            contract.claimDatabaseFunds(databaseId, web3.toWei(amount, 'ether'), (e, data) => {
                this.closePopups();
                this.componentDidMount();
            });
        });
    }

    claimFee = (amount) => {
        this.state.databaseContract.claim((e, data) => {

        });
    }

    transferDatabase = (userAccount, newOwner) => {
        const { databaseId } = this.state;

        cyber.getChaingearContract().then(({ contract, web3 }) => {
            contract.transferFrom(userAccount, newOwner, databaseId, (e, data) => {
                this.componentDidMount();
            });
        });
    }

    transferItem = (userAccount, newOwner, entryID) => {
        this.state.databaseContract.transferFrom(userAccount, newOwner, entryID, (e, data) => {
            this.componentDidMount();
        });
    }

    pauseDb = () => {
        const { databaseContract } = this.state;

        this.setLoading(true);
        cyber.callContractMethod(databaseContract, 'pause')
            .then(data => console.log(`Pause DB. Data: ${data}`))
            .then(() => cyber.eventPromise(databaseContract.Pause()))
            .then(results => console.log(`Db paused. Results: ${results}`))
            .then(() => this.componentDidMount())
            .catch((error) => {
                console.log(`Cant pause db. Error: ${error}`);
                this.setLoading(false);
            });
    };

    unpauseDb = () => {
        const { databaseContract } = this.state;

        this.setLoading(true);
        cyber.callContractMethod(databaseContract, 'unpause')
            .then(data => console.log(`Unpause DB. Data: ${data}`))
            .then(() => cyber.eventPromise(databaseContract.Unpause()))
            .then(results => console.log(`Db unpaused. Results: ${results}`))
            .then(() => this.componentDidMount())
            .catch((error) => {
                console.log(`Cant unpause db. Error: ${error}`);
                this.setLoading(false);
            });
    };

    hideEntryError = () => {
        this.setState({
            duplicateFieldFound: false,
            duplicateFieldId: null,
        });
    };

    onTransferOwnership = () => {
        console.log('TRANSFER DB');
    };

    onFundRegistry = () => {
        console.log('onFundRegistry');
    };

    onClaimFunds = () => {
        this.setState({
            claimFundOpen: true,
        });

        console.log('onClaimFunds');
    };

    onClaimFee = () => {
        console.log('onClaimFee');
    };

    onDeleteDb = () => {
        console.log('onDeleteDb');
    };

    closePopups = () => {
        this.setState({
            claimFundOpen: false,
        })
    };


    onUpdatePermissionGroup = () => {
        const newPermissionGroup = this.permissionGroup.value;

        cyber.sendTransactionMethod(_databaseContract.updateCreateEntryPermissionGroup, newPermissionGroup)
            .then(hash => cyber.eventPromise(_databaseContract.PermissionGroupChanged()))
            .then(() => {
                this.setState({
                    permissionGroup: +newPermissionGroup,
                });
            });
    }

    render() {
        const {
            fields, items, loading, isOwner, userAccount, isSchemaExist, databaseSymbol,
            duplicateFieldFound, duplicateFieldId, isDbPaused, ipfsGateway, beneficiaries, permissionGroup,
        } = this.state;


        const rows = items.map((item, index) => (
            <DatabaseItem
                clameRecord={ this.clameRecord }
                removeItemClick={ this.removeItemClick }
                fundEntryClick={ this.fundEntryClick }
                userAccount={ userAccount }
                onUpdate={ values => this.onUpdate(values, item.id) }
                onTransfer={ newOwner => this.transferItem(userAccount, newOwner, item.id) }
                fields={ fields }
                item={ item }
                index={ item.id }
                key={ item.id }
                errorMessage={ duplicateFieldFound && duplicateFieldId === item.id}
                hideEntryError={ this.hideEntryError }
                isDbPaused={ isDbPaused }
            />
        ));

        const {
            name,
            description,
            createdTimestamp,
            entryCreationFee,
            admin,
            totalFee,
            funded,
            tag,
            owner,
            contractVersion,
            databaseAddress,
            entryCoreAddress,
            ipfsHash,
            claimFundOpen,
        } = this.state;

        const permissionGroupStr = CreateEntryPermissionGroup[permissionGroup].label;

        const showAddButton = (isOwner || permissionGroup === Permission.AllUsers ) && !isDbPaused && isSchemaExist;

        return (
            <div>
                <StatusBar
                    open={ loading }
                    message='loading...'
                />

                <Popup open={claimFundOpen}>
                    <PopupTitle>Im title</PopupTitle>
                    <PopupContent>
                        Available to claim: {funded}
                        <input ref={node => this.claimDbInput = node} />
                    </PopupContent>
                    <PopupFooter>
                        <Button onClick={this.closePopups}>Cancel</Button>
                        <Button onClick={() => this.claimDatabase(this.claimDbInput.value)}>Confirm</Button>
                    </PopupFooter>
                </Popup>

                <MainContainer>
                    <Section>
                        <div style={ { marginLeft: '15px' } }>
                            <ActionLink to='/'>BACK TO CHAINGEAR</ActionLink>
                            {!isSchemaExist &&
                                <ActionLink style={{marginLeft: 15}} to={`/schema/${databaseSymbol}`}>Define schema</ActionLink>
                            }
                        </div>
                    </Section>
                    <Section>
                        <DbHeader>
                            <DbHeaderLine>
                                <DbHeaderLeft>
                                    <DbHeaderName>{name}</DbHeaderName>
                                </DbHeaderLeft>
                                <DbHeaderRight>
                                    <DbMenu>
                                        <MenuPopup>
                                            <MenuPopupItem
                                              icon={<MenuPopupEditIcon />}
                                              onClick={this.onTransferOwnership}
                                            >
                                                Transfer ownership
                                            </MenuPopupItem>
                                            <MenuSeparator />
                                            <MenuPopupItem
                                                icon={<MenuPopupEditIcon />}
                                                onClick={this.onFundRegistry}
                                            >
                                                Fund registry
                                            </MenuPopupItem>
                                            <MenuPopupItem
                                                icon={<MenuPopupEditIcon />}
                                                onClick={this.onClaimFunds}
                                            >
                                                Claim Funds
                                            </MenuPopupItem>
                                            <MenuPopupItem
                                               icon={<MenuPopupEditIcon />}
                                               onClick={this.onClaimFee}
                                            >
                                                Claim Fees
                                            </MenuPopupItem>
                                            <MenuSeparator />
                                            <MenuPopupItem
                                               icon={<MenuPopupDeleteIcon />}
                                               onClick={this.onDeleteDb}
                                            >
                                                Delete registry
                                            </MenuPopupItem>
                                        </MenuPopup>
                                    </DbMenu>
                                </DbHeaderRight>
                            </DbHeaderLine>

                            <DbHeaderLine>
                                <DbHeaderLeft>
                                    symbol: { databaseSymbol }
                                </DbHeaderLeft>

                                <DbHeaderRight>
                                    status: { isDbPaused ? 'paused' : 'operational' }
                                </DbHeaderRight>
                            </DbHeaderLine>
                        </DbHeader>
                    </Section>
                    <Section title='General'>
                        <SectionContent style={ { width: '25%' } }>
                            <Centred>
                                <BoxTitle>
                                    Created:
                                </BoxTitle>
                                <div style={ { height: 100, color: '#000000' } }>
                                    {createdTimestamp ? moment(new Date(createdTimestamp.toNumber() * 1000)).format('DD/MM/YYYY mm:hh:ss') : ''}
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
                                    style={ { height: 100, justifyContent: (isOwner && !isDbPaused) ? 'space-around' : 'start' } }
                                >
                                    <span>
                                        {funded}
                                        {' '}
                                        ETH
                                    </span>

                                    {isOwner &&!isDbPaused && (
                                        <ValueInput
                                            onInter={ this.claimDatabase }
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
                                    style={ { height: 100, justifyContent: (isOwner && !isDbPaused) ? 'space-around' : 'start' } }
                                >
                                    <span>
                                        {totalFee}
                                        {' '}
                                        ETH
                                    </span>
                                    {isOwner && !isDbPaused && <Button style={ { width: 119 } } onClick={ this.claimFee }>clame fee</Button>}
                                </FundContainer>

                            </Centred>
                        </SectionContent>

                    </Section>

                    <Section>

                        <SectionContent title='Overview' grow={ 3 }>
                            <FormField
                                label='Description'
                                value={ description }
                                onUpdate={ isOwner && !isDbPaused && this.changeDescription }
                            />
                            <FormField
                                label='Tags'
                                value={ tag }
                            />
                            <FormField
                                label='Record Fee'
                                value={ entryCreationFee.toString() }
                                valueType='ETH'
                                onUpdate={ isOwner && isDbPaused && this.changeEntryCreationFee }
                            />
                            <FormField
                              label='Permissions'
                              value={ permissionGroupStr }
                              onUpdate={ (isOwner && isDbPaused) && this.onUpdatePermissionGroup }
                            >
                                <select
                                  ref={ (node) => { this.permissionGroup = node; } }
                                  defaultValue={ permissionGroup }
                                >
                                    {Object.keys(CreateEntryPermissionGroup).map((n) => {
                                        const { label } = CreateEntryPermissionGroup[n];

                                        return (
                                            <option value={ n } key={ n }>{label}</option>
                                        );
                                    })}
                                </select>
                            </FormField>
                            <FormField
                                label='Entries'
                                value={ rows.length }
                            />
                            <FormField
                                label='Version'
                                value={ contractVersion }
                            />
                            <FormField
                                label='Database address'
                                value={ databaseAddress }
                            />
                            <FormField
                                label='Schema address'
                                value={ entryCoreAddress }
                            />
                            <FormField
                                label='Abi link'
                                value={ (
                                    <a href={ `${ipfsGateway}/ipfs/${ipfsHash}` } target='_blank'>
                                        {ipfsHash}
                                    </a>
                                ) }
                            />
                        </SectionContent>

                        <SectionContent title='Beneficiaries' grow={ 0 } style={ { width: '25%' } }>

                            <Centred>
                                <BenContainer>
                                    <BenPieChart bens={beneficiaries} />
                                </BenContainer>
                            </Centred>

{/*                            <Centred>
                                <div>
                                    <TransferForm
                                        height={ (isOwner && !isDbPaused) ? 'auto' : 140 }
                                        address={ owner }
                                        isOwner={ isOwner && !isDbPaused }
                                        onTransfer={ newOwner => this.transferDatabase(userAccount, newOwner) }
                                    />
                                </div>
                                <div style={{marginBottom: 20}}>
                                    {!isDbPaused &&
                                    <ValueInput
                                        onInter={this.fundDatabase}
                                        buttonLable='fund database'
                                        width='100%'
                                    />
                                    }
                                </div>
                                <div>
                                    {!isDbPaused && isOwner &&
                                    <Button onClick={this.pauseDb}>Pause database</Button>
                                    }
                                    {isDbPaused && isOwner &&
                                    <Button onClick={this.unpauseDb}>Unpause database</Button>
                                    }
                                </div>
                            </Centred>*/}
                        </SectionContent>

                    </Section>

                    <DbHeader>
                        <DbHeaderLine>
                            <DbHeaderLeft>
                                RECORDS
                            </DbHeaderLeft>

                            <DbHeaderRight>
                                { showAddButton && <Button onClick={this.add}>Add new record</Button>}
                            </DbHeaderRight>
                        </DbHeaderLine>
                    </DbHeader>
                    <DatabaseList>
                        {rows}
                    </DatabaseList>

                </MainContainer>
                {/*isOwner && !isDbPaused && isSchemaExist && (
                    <AddItemButton onClick={ this.add }>
                        <AddItemButtonText>Add Record</AddItemButtonText>
                        <span>
                            Fee:
                            {entryCreationFee}
                            {' '}
                            ETH
                        </span>
                    </AddItemButton>
                )*/}
            </div>
        );
    }
}


export default Database;