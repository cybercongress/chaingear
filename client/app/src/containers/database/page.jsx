import { Container } from 'unstated';
import { hashHistory } from 'react-router';
import * as cyber from '../../utils/cyber';
import DatabaseV1 from '../../../../../build/contracts/DatabaseV1.json';

let _databaseContract = null;
const initialState = {
    items: [],
    fields: [],
    loading: true,
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

    contractVersion: null,
    databaseAddress: null,
    databaseSymbol: null,
    databaseId: null,
    entryCoreAddress: null,
    entryCoreContract: null,
    abiIpfsHash: null,
    isSchemaExist: false,

    claimFundOpen: false,
    claimFeeOpen: false,
    transferOwnershipOpen: false,
    fundDatabaseOpen: false,
    pauseDatabaseOpen: false,
    resumeDatabaseOpen: false,
    deleteDatabaseOpen: false,

    claimRecordFundOpen: false,
    transferRecordOwnershipOpen: false,
    fundRecordOpen: false,
    deleteRecordOpen: false,
    editRecordOpen: false,

    permissionGroup: 0,
    recordForAction: null,
};

class ViewRegistry extends Container {
    state = initialState;


    init = (databaseSymbol) => {
        this.setState(initialState);

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
        let _abiIpfsHash = null;

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
            .then(() => cyber.callContractMethod(_databaseContract, 'getPaused'))
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
                    .all([fundedPromise, totalFeePromise,
                        ownerPromise, descriptionPromise, entryCreationFeePromise]);
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
            .then(() => cyber.callContractMethod(_databaseContract, 'getSchemaDefinition'))
            .then((schemaDefinitionJson) => {
                const schemaDefinition = JSON.parse(schemaDefinitionJson);

                _fields = schemaDefinition.fields.map(field => ({
                    ...field,
                    unique: field.unique === 1,
                }));

                _abiIpfsHash = schemaDefinition.build.ABI;

                return schemaDefinition.build;
            })
            .then(buildOpts => cyber.getAbiByFields(_newState.name, _fields, buildOpts))
            .then((abi) => {
                _abi = abi;
                _entryCoreContract = _web3.eth.contract(_abi).at(_entryCoreAddress);
            })
            .then(() => this.setState({
                databaseContract: _databaseContract,
                entryCoreAddress: _entryCoreAddress,
                entryCoreContract: _entryCoreContract,
                fields: _fields,
                abi: _abi,
                web3: _web3,
                abiIpfsHash: _abiIpfsHash,
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
    };

    getDatabaseItems = () => {
        const {
            databaseContract: contract, fields, abi, web3,
        } = this.state;

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

    /*
    *  Database Actions
    */

    claimDbFee = () => {
        // not implemented
    };

    onUpdatePermissionGroup = () => {
        const newPermissionGroup = this.permissionGroup.value;

        this.setLoading(true);

        cyber.sendTransactionMethod(
            _databaseContract.updateCreateEntryPermissionGroup, newPermissionGroup,
        )
            .then(hash => cyber.eventPromise(_databaseContract.PermissionGroupChanged()))
            .then(() => {
                this.setState({
                    permissionGroup: +newPermissionGroup,
                    loading: false,
                });
            });
    };

    changeDescription = (description) => {
        const { databaseContract, databaseSymbol } = this.state;

        this.setLoading(true);

        cyber.callContractMethod(databaseContract, 'updateDatabaseDescription', description)
            .then(data => console.log(`Description change. Tx:${data}`))
            .then(() => cyber.eventPromise(databaseContract.DescriptionUpdated()))
            .then(results => console.log(`Description changed. Results: ${results}`))
            .then(() => this.init(databaseSymbol))
            .catch(() => this.setLoading(false));
    };

    changeDbTag = (tag) => {
        // not implemented
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

    fundDatabase = (amount) => {
        const { databaseId, web3, databaseSymbol } = this.state;
        let chaingerContract;

        this.closePopups();

        this.setLoading(true);
        cyber.getChaingearContract()
            .then((contract) => {
                chaingerContract = contract;
            })
            .then(() => cyber.callContractMethod(chaingerContract, 'fundDatabase', databaseId, {
                value: web3.toWei(amount, 'ether'),
            }))
            .then(() => cyber.eventPromise(chaingerContract.DatabaseFunded()))
            .then(() => {
                this.init(databaseSymbol);
            });
    };

    claimDatabaseFunds = (amount) => {
        const { databaseId, web3, databaseSymbol } = this.state;
        let chaingerContract;

        this.closePopups();

        this.setLoading(true);
        cyber.getChaingearContract()
            .then((contract) => {
                chaingerContract = contract;
            })
            .then(() => cyber.callContractMethod(
                chaingerContract, 'claimDatabaseFunds', databaseId, web3.toWei(amount, 'ether'),
            ))
            .then(data => console.log(`Claim database funds. Data: ${data}`))
            .then(() => cyber.eventPromise(chaingerContract.DatabaseFundsClaimed()))
            .then(() => this.init(databaseSymbol))
            .catch((error) => {
                console.log(`Cant claim database funds. Details: ${error}`);
                this.setLoading(false);
            });
    };

    transferDatabaseOwnership = (currentOwner, newOwner) => {
        const { databaseId, databaseSymbol } = this.state;
        let chaingerContract;

        this.closePopups();

        this.setLoading(true);
        cyber.getChaingearContract()
            .then((contract) => {
                chaingerContract = contract;
            })
            .then(() => cyber.callContractMethod(
                chaingerContract, 'transferFrom', currentOwner, newOwner, databaseId,
            ))
            .then(data => console.log(`Transfer db ownership. Data: ${data}`))
            .then(() => cyber.eventPromise(
                chaingerContract.Transfer(),
            ))
            .then(() => this.init(databaseSymbol))
            .catch((error) => {
                console.log(`Cant transfer db ownership. Error: ${error}`);
                this.setLoading(false);
            });
    };

    pauseDb = () => {
        const { databaseContract, databaseSymbol } = this.state;

        this.closePopups();

        this.setLoading(true);
        cyber.callContractMethod(databaseContract, 'pause')
            .then(data => console.log(`Pause DB. Data: ${data}`))
            .then(() => cyber.eventPromise(databaseContract.Pause()))
            .then(results => console.log(`Db paused. Results: ${results}`))
            .then(() => this.init(databaseSymbol))
            .catch((error) => {
                console.log(`Cant pause db. Error: ${error}`);
                this.setLoading(false);
            });
    };

    unpauseDb = () => {
        const { databaseContract, databaseSymbol } = this.state;

        this.closePopups();

        this.setLoading(true);
        cyber.callContractMethod(databaseContract, 'unpause')
            .then(data => console.log(`Unpause DB. Data: ${data}`))
            .then(() => cyber.eventPromise(databaseContract.Unpause()))
            .then(results => console.log(`Db unpaused. Results: ${results}`))
            .then(() => this.init(databaseSymbol))
            .catch((error) => {
                console.log(`Cant unpause db. Error: ${error}`);
                this.setLoading(false);
            });
    };

    deleteDb = () => {
        const { databaseId } = this.state;
        let chaingerContract;

        this.closePopups();

        this.setLoading(true);
        cyber.getChaingearContract()
            .then((contract) => {
                chaingerContract = contract;
            })
            .then(() => cyber.callContractMethod(chaingerContract, 'deleteDatabase', databaseId))
            .then(data => console.log(`DeleteDB: ${databaseId}. Tx: ${data}`))
            .then(() => cyber.eventPromise(chaingerContract.DatabaseDeleted()))
            .then(() => hashHistory.push('/'))
            .catch((error) => {
                console.log(`Cant delete database. Details: ${error}`);
                this.closePopups();
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

    /*
    *  Record Actions
    */

    addRecord = () => {
        const { databaseContract, name, databaseSymbol } = this.state;

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
            .then(() => this.init(databaseSymbol))
            .catch(() => {
                console.log(`Cannot add entry to ${name}`);
            });
    };

    transferRecordOwnership = (currentOwner, newOwner, entryID) => {
        const { databaseSymbol, databaseContract } = this.state;

        this.closePopups();

        this.setLoading(true);
        cyber.callContractMethod(
            databaseContract, 'transferFrom', currentOwner, newOwner, entryID,
        )
            .then(data => console.log(`Transfer entry #${entryID} ownership. Tx: ${data}`))
            .then(() => cyber.eventPromise(databaseContract.Transfer()))
            .then(() => this.init(databaseSymbol));
    };

    claimRecord = (entryID, amount) => {
        const { databaseSymbol, databaseContract, web3 } = this.state;

        this.closePopups();

        this.setLoading(true);
        cyber.callContractMethod(
            databaseContract, 'claimEntryFunds', entryID, web3.toWei(amount, 'ether'),
        )
            .then(data => console.log(`Claim entry #${entryID} funds(${amount} ETH). Tx: ${data}`))
            .then(() => cyber.eventPromise(databaseContract.EntryFundsClaimed()))
            .then(() => this.init(databaseSymbol));
    };

    fundRecord = (id, value) => {
        this.setState({ loading: true });

        this.closePopups();
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

    updateRecord = (values, entryId) => {
        const { entryCoreContract } = this.state;

        this.setLoading(true);

        cyber.callContractMethod(entryCoreContract, 'updateEntry', entryId, ...values)
            .then(data => console.log(`Update record. Data: ${data}`))
            .then(() => cyber.eventPromise(entryCoreContract.EntryUpdated()))
            .then(() => this.getDatabaseItems())
            .then(items => this.setState({
                items,
                loading: false,
            }))
            .catch(() => this.setLoading(false));
    };

    deleteRecord = (id) => {
        const { databaseContract } = this.state;

        this.closePopups();
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

    onRecordTransferOwnership = (record) => {
        this.setState({
            transferRecordOwnershipOpen: true,
            recordForAction: record,
        });
    };

    onFundRecord = (record) => {
        this.setState({
            fundRecordOpen: true,
            recordForAction: record,
        });
    };

    onClaimRecordFunds = (record) => {
        this.setState({
            claimRecordFundOpen: true,
            recordForAction: record,
        });
    };

    onDeleteRecord = (record) => {
        this.setState({
            deleteRecordOpen: true,
            recordForAction: record,
        });
    };

    onRecordEdit = (record) => {
        this.setState({
            editRecordOpen: true,
            recordForAction: record,
        });
    };

    /*
    *  Page Actions
    */

    setLoading = (value) => {
        this.setState({
            loading: value,
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

            claimRecordFundOpen: false,
            transferRecordOwnershipOpen: false,
            fundRecordOpen: false,
            deleteRecordOpen: false,
            editRecordOpen: false,
        });
    };
}

export default new ViewRegistry();
