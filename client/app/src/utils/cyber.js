import Web3 from 'web3';
import ChaingearBuild from '../../../../build/contracts/Chaingear.json';
import generateContractCode from './generateContractCode';
import DatabaseV1 from '../../../../build/contracts/DatabaseV1.json';

/*
*  WEB3
*/

let currentWeb3;

const loadWeb3 = new Promise(((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener('load', () => {
        let results;
        let { web3 } = window;

        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        if (typeof web3 !== 'undefined') {
            // Use Mist/MetaMask's provider.

            if (web3.currentProvider) {
                web3 = new Web3(web3.currentProvider);
            } else {
                const provider = new Web3.providers.HttpProvider();

                web3 = new Web3(provider);
            }

            results = {
                web3,
            };

            console.log('Injected web3 detected.');

            resolve(results);
        } else {
            // Fallback to localhost if no web3 injection. We've configured this to
            // use the development console's port by default.
            web3 = new Web3(new Web3.providers.HttpProvider());

            results = {
                web3,
            };

            console.log('No web3 instance injected, using Local web3.');

            resolve(results);
        }
    });
}));

export const getWeb3 = new Promise((resolve) => {
    if (currentWeb3) {
        resolve({ web3: currentWeb3 });
    } else {
        loadWeb3.then(({ web3 }) => {
            currentWeb3 = web3;
            resolve({ web3 });
        });
    }
});

export const getDefaultAccount = () => new Promise(resolve => getWeb3
    .then(({ web3 }) => {
        const { defaultAccount } = web3.eth;

        if (defaultAccount) {
            resolve(defaultAccount);
        } else {
            console.log('ETH default account is null');
            resolve(null);
        }
    }));

export const setDefaultAccount = address => new Promise(resolve => getWeb3
    .then(() => { currentWeb3.eth.defaultAccount = address; })
    .then(() => resolve()));

/*
*  IPFS
*/

const IPFS = require('ipfs-api');

const getIpfsConfig = () => {
    if (window.getIpfsConfig) {
        return window.getIpfsConfig();
    }

    return Promise.resolve({
        host: 'localhost',
        port: 5001,
        protocol: 'http',
    });
};

export const getIpfsGateway = () => {
    if (window.getIpfsGateway) {
        return window.getIpfsGateway();
    }

    return Promise.resolve('http://localhost:8080');
};

/*
*  Networks
*/

let currentNetworkId;

const networksIds = {
    42: 'Kovan',
    1: 'Main',
    5777: 'TestNet',
    4: 'Rinkeby',
};

export const checkNetwork = () => new Promise((resolve) => {
    const networks = Object.keys(ChaingearBuild.networks);

    getWeb3.then(({ web3 }) => {
        web3.version.getNetwork((err, netId) => {
            currentNetworkId = netId;

            resolve({
                isCorrectNetwork: networks.indexOf(netId) !== -1,
                networkId: netId,
                contractNetworks: networks,
            });
        });
    });
});

export const getNetworkStr = (networkId) => {
    if (networksIds[networkId]) {
        return networksIds[networkId];
    }

    return 'Unknown network';
};

/*
*  Wrappers
*/

export const callContractMethod = (contract, method, ...args) => new Promise((resolve, reject) => {
    contract[method].apply(contract, [...args, (e, data) => {
        if (e) {
            console.log('Rejected contract call. Method: ', method, ' args: ', args);
            reject(e);
        } else {
            resolve(data);
        }
    }]);
});

export const sendTransactionMethod = (contractMethod, ...args) => new Promise((resolve, reject) => {
    contractMethod.sendTransaction.apply(contractMethod, [...args, (e, data) => {
        if (e) {
            console.log('Rejected send transaction method. Args: ', args);
            reject(e);
        } else {
            resolve(data);
        }
    }]);
});

export const callWeb3EthMethod = (web3, method, ...args) => new Promise((resolve, reject) => {
    web3.eth[method].apply(web3, [...args, (e, data) => {
        if (e) {
            console.log('Rejected web3.eth call. Method: ', method, ' args: ', args);
            reject(e);
        } else {
            resolve(data);
        }
    }]);
});

export const eventPromise = event => new Promise((resolve, reject) => {
    event.watch((error, results) => {
        event.stopWatching(() => {});
        if (error) {
            reject(error);
        } else {
            resolve(results);
        }
    });
});

let chaingearContract;

export const getChaingearContract = () => new Promise((resolve) => {
    getWeb3
        .then(({ web3 }) => {
            if (!chaingearContract) {
                chaingearContract = web3.eth
                    .contract(ChaingearBuild.abi)
                    .at(ChaingearBuild.networks[currentNetworkId].address);
            }

            resolve(chaingearContract);
        });
});


let ethAccounts;

export const getEthAccounts = () => new Promise((resolve) => {
    if (ethAccounts) {
        resolve(ethAccounts);
    } else {
        getWeb3
            .then(({ web3 }) => callWeb3EthMethod(web3, 'getAccounts'))
            .then((accounts) => {
                ethAccounts = accounts;
                resolve(accounts);
            });
    }
});


let abis = {};

export const init = () => new Promise((resolve) => {
    const abisCache = localStorage.getItem('abis') || '{}';

    abis = JSON.parse(abisCache);

    if (chaingearContract && currentWeb3 && ethAccounts) {
        resolve({
            contract: chaingearContract,
            web3: currentWeb3,
            accounts: ethAccounts,
        });
    } else {
        getWeb3
            .then(() => getEthAccounts())
            .then(() => getChaingearContract())
            .then(() => setDefaultAccount(ethAccounts[0])) // todo: set correct account
            .then(() => resolve({
                contract: chaingearContract,
                web3: currentWeb3,
                accounts: ethAccounts,
            }));
    }
});

// TODO: move in npm package
export const loadCompiler = (cb) => {
    setTimeout(() => {
        window.BrowserSolc.loadVersion('soljson-v0.4.25+commit.59dbf8f1.js', cb);
    }, 30);
};

export const mapDatabase = (rawDatabase, id) => ({
    id,
    name: rawDatabase[0],
    symbol: rawDatabase[1],
    address: rawDatabase[2],
    contractVersion: rawDatabase[3],
    createdTimestamp: rawDatabase[4],
    ipfsHash: '',
    admin: rawDatabase[5],
    supply: rawDatabase[6],
});

export const getItems = (contract, getIdsMethod,
    getEntryByIdMethod, mapFn) => new Promise((topResolve) => {

    contract[getIdsMethod]((e, ids) => {
        const idsArray = ids.map(id => id.toNumber());

        const promises = idsArray.map(id => new Promise((itemResolve, itemReject) => {
            contract[getEntryByIdMethod](id, (error, data) => {
                if (error) {
                    itemReject(error);
                } else {
                    itemResolve({
                        data,
                        id,
                    });
                }
            });
        }));

        Promise.all(promises).then((items) => {
            const results = items.map(item => mapFn(item.data, item.id));

            topResolve(results);
        });
    });
});

export const getItemsByIds = (contract, idsArray,
    getEntryByIdMethod, mapFn) => new Promise((topResolve) => {

    const promises = idsArray.map(id => new Promise((itemResolve, itemReject) => {
        contract[getEntryByIdMethod](id, (error, data) => {
            if (error) {
                itemReject(error);
            } else {
                itemResolve({
                    data,
                    id,
                });
            }
        });
    }));

    Promise.all(promises).then((items) => {
        const results = items.map(item => mapFn(item.data, item.id));

        topResolve(results);
    });
});


const Dependencies = require('../resources/Dependencies.sol');

export const compileDatabase = (code, contractName, compiler, compilerOpts = {
    isOptimizerEnabled: true,
    runs: 200,
}) => new Promise((resolve, reject) => {

    const sources = {
        'Dependencies.sol': Dependencies,
        [contractName]: `pragma solidity 0.4.25; ${code}`,
    };

    const settings = {
        optimizer: {
            enabled: compilerOpts.isOptimizerEnabled,
        },
        runs: compilerOpts.runs,
    };

    setTimeout(() => {
        const compiledContract = compiler.compile({
            sources, settings,
        }, 1);

        console.log(compiledContract);
        if (compiledContract.errors && compiledContract.errors.length > 0) {
            reject(compiledContract.errors[0]);
            return;
        }

        try {
            const abi = compiledContract.contracts[`${contractName}:Schema`].interface;
            const bytecode = `0x${compiledContract.contracts[`${contractName}:Schema`].bytecode}`;

            resolve({
                abi,
                bytecode,
            });
        } catch (e) {
            reject(e);
        }
    }, 20);
});

export const getDatabases = () => {
    const mapFunc = (item, id) => ({
        name: item[0],
        symbol: item[1],
        address: item[2],
        contractVersion: item[3],
        createdTimestamp: item[4],
        ipfsHash: '',
        admin: item[5],
        supply: item[6],
        id,
    });

    return getChaingearContract()
        .then(contract => getItems(contract, 'getDatabasesIDs', 'getDatabase', mapFunc));
};

export const removeDatabase = (address, cb) => getChaingearContract()
    .then(contract => contract.deleteDatabase(address));

export const getDatabaseFieldsByHash = ipfsHash => new Promise((resolve) => {
    getIpfsConfig().then((config) => {
        const ipfs = new IPFS(config);

        ipfs.get(ipfsHash, (err, files) => {
            const buf = files[0].content;
            const abi = JSON.parse(buf.toString());
            // TODO move extraction from entries to other ABIs object,
            // entries should be internal, now public for supporting frontend
            let fields = abi.filter(x => x.name === 'entries')[0].outputs;

            fields = fields.filter(x => x.name !== 'metainformation' && x.name !== 'owner' && x.name !== 'lastUpdateTime');
            resolve({
                ipfsHash,
                abi,
                fields,
            });
        });
    });
});

export const saveInIPFS = jsonStr => new Promise((resolve, reject) => {
    getIpfsConfig().then((config) => {
        const ipfs = new IPFS(config);
        const buffer = Buffer.from(jsonStr);

        ipfs.add(buffer, (err, ipfsHash) => {
            if (err) {
                reject(err);
            } else {
                const hash = ipfsHash[0].path;

                resolve(hash);
            }
        });
    });
});

export const deploySchema = (name, fields, databaseContract) => {
    const code = generateContractCode(name, fields);

    let tempByteCode;

    //todo: fix default account
    let account;

    return new Promise((resolve, reject) => {
        loadCompiler((compiler) => {
            getDefaultAccount()
                .then((defaultAccount) => {
                    account = defaultAccount;
                })
                .then(() => compileDatabase(code, name, compiler))
                .then(({ abi, bytecode }) => {
                    tempByteCode = bytecode;
                    return saveInIPFS(abi);
                })
                .then(ipfsHash => JSON.stringify({
                    build: {
                        compiler: '0.4.25+commit.59dbf8f1.Emscripten.clang',
                        optimizer: true,
                        runs: 200,
                        ABI: ipfsHash,
                    },
                    fields: fields.map(field => ({
                        ...field,
                        unique: field.unique ? 1 : 0,
                    })),
                }))
                .then(schemaDefinition => callContractMethod(databaseContract, 'initializeDatabase', schemaDefinition, tempByteCode, {from: account}))
                .then((data) => {
                    console.log(`Schema created for ${name}. Data: ${data}`);
                    resolve(data);
                })
                .catch((error) => {
                    console.log(`Cannot create shema for ${name}. Error: ${error}`);
                    reject(error);
                });
        });
    });
};

export const deployDatabase = (name, symbol, version, beneficiaries, stakes) => {
    let tChaingearContract;
    let tdefaultAccount;

    return new Promise((resolve, reject) => {
        getDefaultAccount()
            .then((defaultAccount) => {
                tdefaultAccount = defaultAccount;
                return getChaingearContract();
            })
            .then((contract) => {
                tChaingearContract = contract;
                return callContractMethod(contract, 'getCreationFeeWei');
            })
            .then((fee) => {
                const creationFee = fee.toNumber();

                return sendTransactionMethod(tChaingearContract.createDatabase,
                    version, beneficiaries, stakes, name, symbol, {
                        from: tdefaultAccount,
                        value: creationFee,
                    });
            })
            .then((txHash) => {
                console.log(`Database creation ${name} tx: ${txHash}`);
                resolve(txHash);
            })
            .catch((error) => {
                console.log(`Cannot create database ${name}. Error: ${error}`);
                reject(error);
            });
    });
};

export const getDatabaseContract = address => getWeb3
    .then(({ web3 }) => web3.eth.contract(DatabaseV1.abi).at(address));

export const getDatabaseData = (databaseContract, fields, abi) => new Promise((resolve) => {
    let tEntryCoreAddress;
    let tEntryCore;

    const mapFn = (item, id) => {
        const aItem = Array.isArray(item) ? item : [item];

        return fields.reduce((o, field, index) => ({
            ...o, [field.name]: aItem[index],
        }), {
            __index: id,
        });
    };

    callContractMethod(databaseContract, 'getEntriesStorage')
        .then((entryAddress) => {
            tEntryCoreAddress = entryAddress;
            tEntryCore = currentWeb3.eth.contract(abi).at(entryAddress);
        })
        .then(() => callContractMethod(databaseContract, 'getEntriesIDs'))
        .then((entriesIDs) => {
            const idsArray = entriesIDs.map(id => id.toNumber());

            getItemsByIds(tEntryCore, idsArray, 'readEntry', mapFn)
                .then((items) => {
                    resolve({
                        items,
                        fields,
                        entryAddress: tEntryCoreAddress,
                    });
                });
        });
});

export const fundEntry = (address, id, value) => new Promise((resolve) => {
    const databaseContract = currentWeb3.eth.contract(DatabaseV1.abi).at(address);

    const event = databaseContract.EntryFunded();

    event.watch((e, results) => {
        event.stopWatching(() => {});
        resolve(results.args);
    });
    databaseContract.fundEntry(id, {
        value: currentWeb3.toWei(value, 'ether'),
    }, (e, d) => {

    });
});

export const getSafeBalance = address => new Promise((resolve) => {
    const databaseContract = currentWeb3.eth.contract(DatabaseV1.abi).at(address);

    databaseContract.safeBalance((e, data) => {
        resolve(data);
    });
});

export const updateEntryCreationFee = (address, newfee) => new Promise((resolve, reject) => {
    const database = currentWeb3.eth.contract(DatabaseV1.abi).at(address);

    database.updateEntryCreationFee(currentWeb3.toWei(newfee, 'ether'), (e, data) => {
        if (e) { reject(e); } else { resolve(data); }
    });
});

export const getBeneficiaries = dbContract => callContractMethod(dbContract, 'getPayeesCount')
    .then(bensCount => [...Array(bensCount.toNumber()).keys()])
    .then(benIndexArray => benIndexArray.map((benIndex) => {
        const ben = {};

        return callContractMethod(dbContract, 'payees', benIndex)
            .then((benAddress) => {
                ben.address = benAddress;
            })
            .then(() => callContractMethod(dbContract, 'shares', ben.address))
            .then((benStake) => {
                ben.stake = benStake.toNumber();
            })
            .then(() => callContractMethod(dbContract, 'released', ben.address))
            .then((benReleased) => {
                ben.released = benReleased.toNumber();
            })
            .then(() => ben)
            .catch((error) => {
                console.log(`Cannot get beneficiary for DB. Error: ${error}`);
            });
    }))
    .then(benPromisses => Promise.all(benPromisses));

export const getAbiByFields = (contractName, fields, buildOpts) => new Promise((resolve, reject) => {

    if (abis[contractName]) {
        resolve(abis[contractName]);
        return;
    }

    const code = generateContractCode(contractName, fields);
    const compilerOpts = {
        isOptimizerEnabled: buildOpts.optimizer,
        runs: buildOpts.runs,
    };

    loadCompiler((compiler) => {
        compileDatabase(code, contractName, compiler, compilerOpts)
            .then(({ abi }) => {
                const abiObj = JSON.parse(abi);

                abis[contractName] = abiObj;
                localStorage.setItem('abis', JSON.stringify(abis));
                resolve(abiObj);
            })
            .catch((error) => {
                console.log(`Cannot get abi for contract ${contractName}`);
                reject(error);
            });
    });
});

export {
    generateContractCode,
};
