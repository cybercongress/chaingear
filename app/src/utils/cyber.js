import Web3 from 'web3';
import ChaingearBuild from '../../../build/contracts/Chaingear.json';

import generateContractCode from './generateContractCode';

import Registry from '../../../build/contracts/Registry.json';

let _networkId;

const networks = {
    '42': 'Kovan',
    '1': 'Main',
    '5777': 'TestNet',
    '4': 'Rinkeby',
};

export function checkNetwork() {
    return new Promise(resolve => {

        const networks = Object.keys(ChaingearBuild.networks);

        getWeb3.then(({ web3 }) => {
            web3.version.getNetwork((err, netId) => {
                _networkId = netId;

                resolve({
                    isCorrectNetwork: networks.indexOf(netId) !== -1,
                    networkId: netId,
                    contractNetworks: networks,
                });
            })
        });
    });

}

export const getNetworkStr = (networkId) => {

    if (networks[networkId]) {
        return networks[networkId];
    }

    return 'Unknown network';
};

const moment = require('moment');

// TODO: move in npm package

export const loadCompiler = (cb) => {
    setTimeout(() => {
        window.BrowserSolc.loadVersion('soljson-v0.4.25+commit.59dbf8f1.js', cb);
    }, 30);
};

const IPFS = require('ipfs-api');

export const ipfs = new IPFS({
    host: 'localhost',
    port: 5001,
    protocol: 'http',
});


const Dependencies = require('../Dependencies.sol');

const dateFormat = 'DD/MM/YYYY mm:hh';

export const formatDate = (solidityDate) => {
    const jsDate = new Date(solidityDate * 1000);

    return moment(jsDate).format(dateFormat);
};

export const mapRegistry = (rawRegistry, id) => ({
    id,
    name: rawRegistry[0],
    symbol: rawRegistry[1],
    address: rawRegistry[2],
    contractVersion: rawRegistry[3],
    registrationTimestamp: rawRegistry[4],
    ipfsHash: '',
    admin: rawRegistry[5],
    supply: rawRegistry[6],
});

export const getItems = (contract, getIdsMethod, getEntryByIdMethod, mapFn) => new Promise((topResolve) => {
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

export const getItemsByIds = (contract, idsArray, getEntryByIdMethod, mapFn) => new Promise((topResolve) => {

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

export const compileRegistry = (code, contractName, compiler) => new Promise((resolve, reject) => {
    const input = {
        'Dependencies.sol': Dependencies,
        [contractName]: `pragma solidity ^0.4.25; ${code}`,
    };

    setTimeout(() => {
        const compiledContract = compiler.compile({
            sources: input,
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

const getWeb3 = new Promise(((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener('load', () => {
        let results;
        let web3 = window.web3;
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

export const estimateNewRegistryGas = bytecode => new Promise((resolve, reject) => {
    getWeb3.then(({
        web3,
    }) => {
        web3.eth.estimateGas({
            data: bytecode,
        }, (e, gasEstimate) => {
            if (e) {
                reject(e);
            } else {
                resolve({
                    web3,
                    gasEstimate,
                });
            }
        });
    });
});

export const deployRegistry = (bytecode, abi, web3, opt) => {
    const {
        gasEstimate,
        contractName,
        permissionType,
        entryCreationFee,
        description,
        tags,
    } = opt;

    return new Promise((resolve, reject) => {
        const Contract = web3.eth.contract(JSON.parse(abi));
        const currentAccount = web3.eth.accounts[0];
        // TODO need frontend for _benefitiaries and _shares
        const _benefitiaries = [currentAccount]; // ???
        const _shares = [100]; // ???
        const _entryCreationFee = web3.toWei(entryCreationFee, 'ether'); // ???

        Contract.new(
            _benefitiaries,
            _shares, [{
                a: '0xa3564D084fabf13e69eca6F2949D3328BF6468Ef',
                count: 5,
            }],
            permissionType,
            _entryCreationFee,
            contractName,
            description,
            tags, {
                from: currentAccount,
                data: bytecode,
                gas: gasEstimate,
            }, (err, myContract) => {
                if (err) {
                    reject(err);
                } else if (myContract.address) {
                    resolve(myContract.address);
                }
            },
        );
    });
};


export const getChaingearContract = () => getWeb3
    .then((results) => {
        const web3 = results.web3;
        const contract = web3.eth.contract(ChaingearBuild.abi).at(ChaingearBuild.networks[_networkId].address);
        // registryContract.setProvider(results.web3.currentProvider);
        // results.web3.eth.defaultAccount = results.web3.eth.accounts[0];

        return new Promise((resolve) => {
            results.web3.eth.getAccounts((e, accounts) => {
                results.web3.eth.defaultAccount = accounts[0];

                resolve({
                    contract,
                    web3: results.web3,
                    accounts,
                });
            });
        });
    });

export const register = (name, adress, hash) => new Promise((resolve) => {
    getChaingearContract().then(({
        contract,
        web3,
    }) => {
        contract.register(name, adress, hash, {
            from: web3.eth.accounts[0],
        }).then((x) => {
            resolve();
        });
    });
});

export const getDefaultAccount = () => new Promise(resolve => getWeb3
    .then(({ web3 }) => web3.eth.getAccounts((error, accounts) => {
        // TODO: research how to return default account in cytb provider
        resolve(accounts[0]);
    })));

export const getRegistries = () => {
    const mapFunc = (item, id) => ({
        name: item[0],
        symbol: item[1],
        address: item[2],
        contractVersion: item[3],
        registrationTimestamp: item[4],
        ipfsHash: '',
        admin: item[5],
        supply: item[6],
        id,
    });

    return getChaingearContract()
        .then(({ contract }) => getItems(contract, 'getRegistriesIDs', 'readRegistry', mapFunc));
};

export const callContractMethod = (contract, method, ...args) => {
    return new Promise((resolve, reject) => {
        contract[method].apply(contract, [...args, (e, data) => {
            if (e) {
                console.log('Rejected contract call. Method: ', method, ' args: ', args);
                reject(e);
            } else {
                resolve(data);
            }
        }]);
    });
};

export const sendTransactionMethod = (contractMethod, ...args) => {
    return new Promise((resolve, reject) => {
        contractMethod.sendTransaction.apply(contractMethod, [...args, (e, data) => {
            if (e) {
                console.log('Rejected send transaction method. Args: ', args);
                reject(e);
            } else {
                resolve(data);
            }
        }]);
    });
};

export const callWeb3EthMethod = (web3, method, ...args) => {
    return new Promise((resolve, reject) => {
        web3.eth[method].apply(web3, [...args, (e, data) => {
            if (e) {
                console.log('Rejected web3.eth call. Method: ', method, ' args: ', args);
                reject(e);
            } else {
                resolve(data);
            }
        }]);
    });
};

/*export const getRegistry = () => {
    const accounts = null;

    return getChaingearContract().then(({
        contract,
        web3,
        accounts,
    }) => {
        _accounts = accounts;
        return getItems(contract, 'getRegistriesIDs', 'readRegistry', items => ({
            name: items[0],
            symbol: items[1],
            address: items[2],
            contractVersion: items[3],
            registrationTimestamp: items[4],
            ipfsHash: '',
            admin: items[5],
            supply: items[6],
        })).then(items => ({
            accounts: _accounts,
            items,
        }));
    });
};*/

export const removeRegistry = (address, cb) => getChaingearContract().then(({
    contract,
    web3,
}) => contract.deleteRegistry(address, {
    from: web3.eth.accounts[0],
}));

export const getRegistryFieldsByHash = ipfsHash => new Promise((resolve) => {
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


export {
    getWeb3,
    generateContractCode,
};


export const saveInIPFS = jsonStr => new Promise((resolve, reject) => {
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

// Public API

export const createRegistry = (name, symbol, fields) => {
    const code = generateContractCode(name, fields);

    let _bytecode;
    let _ipfsHash;

    return new Promise((resolve, reject) => {
        loadCompiler((compiler) => {
            compileRegistry(code, name, compiler)
                .then(({
                    abi,
                    bytecode,
                }) => {
                    _bytecode = bytecode;
                    return saveInIPFS(abi);
                })
                .then((ipfsHash) => {
                    _ipfsHash = ipfsHash;
                    return getChaingearContract();
                })
                .then(({
                    contract,
                    web3,
                    accounts,
                }) => {
                    contract.getRegistrationFee((e, data) => {
                        const buildingFee = data.toNumber();

                        contract.registerRegistry.sendTransaction(
                            'V1', [accounts[0]], [100], name, symbol, {
                                value: buildingFee,
                            },
                            (e, data, a, b) => {
                                if (e) {
                                    reject(e);
                                } else {
                                    var event = contract.RegistryRegistered((ee, results) => {
                                        event.stopWatching(() => {});
                                        if (ee) {
                                            reject(ee);
                                        } else {
                                            const registry = web3.eth.contract(Registry.abi).at(results.args.registryAddress);

                                            registry.initializeRegistry(_ipfsHash, _bytecode, (e, data) => {
                                                resolve(results.args);
                                            });
                                        }
                                    });
                                }
                            },
                        );
                    });
                })
                .catch(reject);
        });
    });
};

export const deploySchema = (name, fields, registryContract) => {
    const code = generateContractCode(name, fields);

    let _bytecode;
    let _ipfsHash;

    return new Promise((resolve, reject) => {
        loadCompiler((compiler) => {
            compileRegistry(code, name, compiler)
                .then(({ abi, bytecode }) => {
                    _bytecode = bytecode;
                    return saveInIPFS(abi);
                })
                .then((ipfsHash) => {
                    _ipfsHash = ipfsHash;
                    return getWeb3;
                })
                .then(({ web3 }) => {
                    return callContractMethod(registryContract, 'initializeRegistry', _ipfsHash, _bytecode);
                })
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

export const registerRegistry = (name, symbol, version, beneficiaries, shares) => {
    let _chaingearContract;

    return new Promise((resolve, reject) => {
        getChaingearContract()
            .then(({ contract }) => {
                _chaingearContract = contract;
                return callContractMethod(contract, 'getRegistrationFee');
            })
            .then((fee) => {
                const registrationFee = fee.toNumber();

                return sendTransactionMethod(_chaingearContract.registerRegistry,
                    version, beneficiaries, shares, name, symbol, { value: registrationFee });
            })
            .then((txHash) => {
                console.log(`Register registry ${name} tx: ${txHash}`);
                resolve(txHash);
            })
            .catch((error) => {
                console.log(`Cannot register registry ${name}. Error: ${error}`);
                reject(error);
            });
    });
};

let _contract;
let _web3;
let _accounts;

export const init = () => new Promise((resolve) => {
    if (_web3) {
        resolve({
            contract: _contract,
            web3: _web3,
            accounts: _accounts,
        });
    } else {
        getChaingearContract()
            .then(({
                contract,
                web3,
                accounts,
            }) => {
                _contract = contract;
                _web3 = web3;
                _accounts = accounts;
                resolve({
                    contract,
                    web3,
                    accounts,
                });
            });
    }
});

export const getRegistryContract = (address) => {
    if (_web3) {
        return Promise.resolve(_web3.eth.contract(Registry.abi).at(address));
    }

    return getWeb3
        .then(({web3}) => web3.eth.contract(Registry.abi).at(address));
};

export const getRegistryData = (registryContract, fields, abi) => new Promise((resolve) => {
    let _entryCoreAddress;
    let _entryCore;

    const mapFn = (item, id) => {
        const aItem = Array.isArray(item) ? item : [item];

        return fields.reduce((o, field, index) => {
            o[field.name] = aItem[index];
            return o;
        }, {
            __index: id,
        });
    };

    callContractMethod(registryContract, 'getEntriesStorage')
        .then((entryAddress) => {
            _entryCoreAddress = entryAddress;
            _entryCore = _web3.eth.contract(abi).at(entryAddress);
        })
        .then(() => callContractMethod(registryContract, 'getEntriesIDs'))
        .then((entriesIDs) => {
            const idsArray = entriesIDs.map(id => id.toNumber());

            getItemsByIds(_entryCore, idsArray, 'readEntry', mapFn)
                .then((items) => {
                    resolve({
                        items,
                        fields,
                        entryAddress: _entryCoreAddress,
                    });
                });
        });
});

export const getEntryMeta = () => {

};

export const removeItem = (address, id) => new Promise((resolve) => {
    const registryContract = getRegistryContract(address);

    const event = registryContract.EntryDeleted();

    event.watch((e, results) => {
        event.stopWatching(() => {});
        resolve(results.args);
    });
    registryContract.deleteEntry(id, (e, d) => {});
});

export const fundEntry = (address, id, value) => new Promise((resolve) => {
    const registryContract = _web3.eth.contract(Registry.abi).at(address);

    const event = registryContract.EntryFunded();

    event.watch((e, results) => {
        event.stopWatching(() => {});
        resolve(results.args);
    });
    registryContract.fundEntry(id, {
        value: _web3.toWei(value, 'ether'),
    }, (e, d) => {

    });
});

export const eventPromise = (event) => {
    return new Promise((resolve, reject) => {
        event.watch((error, results) => {
            event.stopWatching(() => {});
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

export const addItem = address => new Promise((resolve) => {
    const registryContract = _web3.eth.contract(Registry.abi).at(address);

    const event = registryContract.EntryCreated();

    event.watch((e, results) => {
        event.stopWatching(() => {});
        resolve(results.args.entryID.toNumber());
    });

    registryContract.getEntryCreationFee((e, data) => {
        const fee = data.toNumber();

        registryContract.createEntry({
            value: fee,
        }, (e, d) => {});
    });
});

export const getSafeBalance = address => new Promise((resolve) => {
    const registryContract = _web3.eth.contract(Registry.abi).at(address);

    registryContract.safeBalance((e, data) => {
        resolve(data);
    });
});

export const updateEntryCreationFee = (address, newfee) => new Promise((resolve, reject) => {
    const registry = _web3.eth.contract(Registry.abi).at(address);

    registry.updateEntryCreationFee(_web3.toWei(newfee, 'ether'), (e, data) => {
        if (e) { reject(e); } else { resolve(data); }
    });
});

export const updateItem = (address, ipfsHash, newEntryId, values) => new Promise((resolve) => {
    const registryContract = _web3.eth.contract(Registry.abi).at(address);

    getRegistryFieldsByHash(ipfsHash)
        .then(({
            abi,
        }) => {
            registryContract.getEntriesStorage((e, entryAddress) => {
                const entryCore = _web3.eth.contract(abi).at(entryAddress);

                const event = entryCore.EntryUpdated();

                event.watch((e, results) => {
                    event.stopWatching(() => {});
                    resolve(results.args);
                });

                const args = [newEntryId, ...values, function (e, dat) {

                }];

                entryCore.updateEntry(...args);
            });
        });
});
