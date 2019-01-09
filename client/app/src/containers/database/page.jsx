

import { Container } from 'unstated';
import * as cyber from '../../utils/cyber';
import DatabaseV1 from '../../../../../build/contracts/DatabaseV1.json';

let _databaseContract = null;

class ViewRegistry extends Container {
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
        claimFeeOpen: false,
        transferOwnershipOpen: false,
        fundDatabaseOpen: false,
        pauseDatabaseOpen: false,
        resumeDatabaseOpen: false,
        deleteDatabaseOpen: false,
        editRecordOpen: false,

        permissionGroup: 0,
        itemForEdit: null,    	
    };


    init = (databaseSymbol) => {
    	this.setState({
            loading: true,
        });

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
    }

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

    }

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
    };

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
    };

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

    claimRecord = (entryID, amount) => {
        this.state.databaseContract.claimEntryFunds(entryID, this.state.web3.toWei(amount, 'ether'), (e, data) => {
            this.componentDidMount();
        });
    };

    setLoading = (value) => {
        this.setState({
            loading: value,
        });
    };

    fundDatabase = (amount) => {
        const { databaseId, web3 } = this.state;
        let _chaingerContract;

        this.setLoading(true);
        this.closePopups();

        cyber.getChaingearContract()
            .then((contract) => {
                _chaingerContract = contract;
            })
            .then(() => cyber.callContractMethod(_chaingerContract, 'fundDatabase', databaseId, {
                value: web3.toWei(amount, 'ether'),
            }))
            .then(() => cyber.eventPromise(_chaingerContract.DatabaseFunded()))
            .then(() => {
                this.componentDidMount();
            });
    };

    claimDatabase = (amount) => {
        const { databaseId, web3 } = this.state;

        this.closePopups();

        cyber.getChaingearContract()
            .then(chaingerContract => cyber
                .callContractMethod(chaingerContract,
                    'claimDatabaseFunds',
                    databaseId, web3.toWei(amount, 'ether')))
            .then(() => this.componentDidMount());
    };

    claimFee = (amount) => {
        this.state.databaseContract.claim((e, data) => {

        });
    };

    transferDatabaseOwnership = (userAccount, newOwner) => {
        const { databaseId } = this.state;

        this.closePopups();

        cyber.getChaingearContract()
            .then(contract => cyber.callContractMethod(contract, 'transferFrom', userAccount, newOwner, databaseId))
            .then(() => this.componentDidMount());
    };

    transferItem = (userAccount, newOwner, entryID) => {
        this.state.databaseContract.transferFrom(userAccount, newOwner, entryID, (e, data) => {
            this.componentDidMount();
        });
    };

    pauseDb = () => {
        const { databaseContract } = this.state;

        this.closePopups();

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

        this.closePopups();

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

    deleteDb = () => {
        const { databaseId } = this.state;

        this.closePopups();

        cyber.getChaingearContract()
            .then(contract => cyber.callContractMethod(contract, 'deleteDatabase', databaseId))
            .then(data => console.log(`DeleteDB: ${databaseId}. Tx: ${data}`));
    };

    hideEntryError = () => {
        this.setState({
            duplicateFieldFound: false,
            duplicateFieldId: null,
        });
    };

    onTransferOwnership = () => {
        this.setState({
            transferOwnershipOpen: true,
        });
    };

    onFundDb = () => {
        this.setState({
            fundDatabaseOpen: true,
        });
    };

    onClaimFunds = () => {
        this.setState({
            claimFundOpen: true,
        });
    };

    onClaimFee = () => {
        this.setState({
            claimFeeOpen: true,
        });
    };

    onDeleteDb = () => {
        this.setState({
            deleteDatabaseOpen: true,
        });
    };

    onPauseDb = () => {
        this.setState({
            pauseDatabaseOpen: true,
        });
    };

    onResumeDb = () => {
        this.setState({
            resumeDatabaseOpen: true,
        });
    };

    onItemEdit = (item) => {
        this.setState({
            editRecordOpen: true,
            itemForEdit: item,
        });
    };

    closePopups = () => {
        this.setState({
            claimFundOpen: false,
            claimFeeOpen: false,
            transferOwnershipOpen: false,
            fundDatabaseOpen: false,
            pauseDatabaseOpen: false,
            resumeDatabaseOpen: false,
            deleteDatabaseOpen: false,
            editRecordOpen: false,
        });
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
    };
}

export default new ViewRegistry();
