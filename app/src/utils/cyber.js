import ChaingearBuild from '../../../build/contracts/Chaingear.json'
// './Chaingear.json'
//'../../../smart-contracts/build/contracts/Chaingear.json'

// './Chaingear.json'

//TODO: move in npm package

import generateContractCode from './generateContractCode';

import Web3 from 'web3'

export const loadCompiler = (cb) => {
  setTimeout(() => {
      window.BrowserSolc.loadVersion("soljson-v0.4.21+commit.dfe3193c.js", cb);
    }, 30);
}

// const ChaingeareableSource = require('../Chaingeareable.sol');

const EntryBasic = require('../EntryBasic.sol');

console.log('>> ' , EntryBasic)


export const compileRegistry = (code, contractName, compiler) => {
  return new Promise((resolve, reject) => {
    const input = {
      // 'Chaingeareable.sol': ChaingeareableSource,
      'EntryBasic.sol': EntryBasic,
      [contractName]: 'pragma solidity ^0.4.21; ' + code,
    };

    setTimeout(() => {
      var compiledContract = compiler.compile({sources : input }, 1);
      if (compiledContract.errors && compiledContract.errors.length > 0) {
        reject(compiledContract.errors[0]);
        return;
      }
      var abi = compiledContract.contracts[contractName +":"+ contractName  ].interface;
      var bytecode = '0x'+compiledContract.contracts[contractName +":"+ contractName ].bytecode;

      resolve({
        abi,
        bytecode
      });
    }, 20);
  })
}


let getWeb3 = new Promise(function(resolve, reject) {
  // Wait for loading completion to avoid race conditions with web3 injection timing.
  window.addEventListener('load', function() {
    var results
    var web3 = window.web3
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider.
      web3 = new Web3(web3.currentProvider)

      results = {
        web3: web3
      }

      console.log('Injected web3 detected.');

      resolve(results)
    } else {
      // Fallback to localhost if no web3 injection. We've configured this to
      // use the development console's port by default.
      var provider = new Web3.providers.HttpProvider('https://kovan.infura.io/eKZdJzgmRo31DJI94iSO')

      web3 = new Web3(provider)

      results = {
        web3: web3
      }

      console.log('No web3 instance injected, using Local web3.');

      resolve(results)
    }
  })
})

export const estimateNewRegistryGas = (bytecode) => {
  return new Promise((resolve, reject) => {
    getWeb3.then(({ web3 }) => {
      web3.eth.estimateGas({data: bytecode }, (e, gasEstimate) => {
        if (e) {
          reject(e);
        } else {
          resolve({ web3, gasEstimate })
        }
      })
    })  
  })  
}




export const deployRegistry = (bytecode, abi, web3, opt) => {
  const {
    gasEstimate,
    contractName,
    permissionType,
    entryCreationFee,
    description,
    tags
  } = opt;

  return new Promise((resolve, reject) => {

      let Contract = web3.eth.contract(JSON.parse(abi));
      const currentAccount = web3.eth.accounts[0];
      var _benefitiaries = [currentAccount]; // ???
      var _shares = [100];// ???
      var _entryCreationFee = web3.toWei(entryCreationFee, 'ether');// ???

      Contract.new(
        _benefitiaries,
        _shares,
        [{ a: '0xa3564D084fabf13e69eca6F2949D3328BF6468Ef', count: 5 }],
        permissionType,
        _entryCreationFee,
        contractName,
        description,
        tags,
       {
         from: currentAccount,
         data:bytecode,
         gas: gasEstimate
       }, (err, myContract) => {
        // console.log(' >> ', err, myContract);
        if (err) {
          reject(err);
        } else {
          if (myContract.address) {
            resolve(myContract.address)
            // this.setState({ status: 'save abi in ipfs...'})
            // const buffer = Buffer.from(JSON.stringify(abi));
            // cyber.ipfs.add(buffer, (err, ipfsHash) => {
            //   const hash = ipfsHash[0].path;
            //   this.setState({ status: 'register contract...'})
            //   cyber.register(contractName, myContract.address, hash).then(() => {
            //     this.setState({ status: '', inProgress: false })
            //     browserHistory.push(`/`);
            //   });
            // })
          }          
        }
       });


  })
}


const getItems = (contract, count, array, mapFn) => {
  return new Promise(resolve => {
    contract[count]().then(lengthData => {
        debugger
      const length = lengthData.toNumber();
      let promises = [];
          for(let i =0; i < length; i++) {
            promises.push(contract[array](i));
          }

          Promise.all(promises).then(data => {
            const results = data.map(mapFn);
            resolve(results);
          })
    })
  })
}

export const getContract = () => {
  return getWeb3
      .then(results => {
      // const contract = require('truffle-contract');
      // const registryContract = contract(ChaingearBuild);
      const web3 = results.web3;
      const contract = web3.eth.contract(ChaingearBuild.abi).at(ChaingearBuild.networks['42'].address);
      // registryContract.setProvider(results.web3.currentProvider);
      results.web3.eth.defaultAccount = results.web3.eth.accounts[0];
      
      return new Promise(resolve => {
        results.web3.eth.getAccounts((e, accounts)=> {
            // debugger
            // registryContract.deployed().then(contract => {
                resolve({
                    contract,
                    web3: results.web3,
                    accounts
                })
            // });    
        })
      })
      
        // .then(accounts => {
        //     return registryContract.deployed().then(contract => ({
        //         contract,
        //         web3: results.web3,
        //         accounts
        //     }));
        // })
      
    })
}

export const register = (name, adress, hash) => {
  return new Promise(resolve => {
    getContract().then(( { contract, web3 }) => {   
      contract.register(name, adress, hash, { from: web3.eth.accounts[0] }).then(x => {
        resolve();
      })
    })
  })
}

export const getRegistry = () => {
  return getContract().then(( { contract, web3 }) => {  
    return getItems2(contract, 'registriesAmount', 'registryInfo', (items) => {
      return ({
        name: items[0],
        address: items[1],
        ipfsHash: items[4]
      })

    })
  })
}


export const removeRegistry = (address, cb) => {
  return getContract().then(( { contract, web3 }) => {  
    return contract.deleteRegistry(address, { from: web3.eth.accounts[0] });
  })
} 


export const getContractByAbi = (address, abi) => {
  return new Promise(resolve => {
    getWeb3.then(({ web3 }) => {
      web3.eth.defaultAccount = web3.eth.accounts[0];
      const CoursetroContract = web3.eth.contract(abi);
      const contract = CoursetroContract.at(address);
      resolve({ web3, contract })
    })
  })
}



export const getItems2 = (contract, count, array, mapFn) => {
  return new Promise(resolve => {
    contract[count]((e, lengthData) => {
      console.log(e, lengthData.toNumber())
      const length = lengthData.toNumber();
      let promises = [];
          for(let i =0; i < length; i++) {
            promises.push(new Promise((itemResolve, itemReject) => {
              contract[array](i, (e, r) => {
                if (e) itemReject(e)
                  else itemResolve(r);
              })
            }));
          }

          Promise.all(promises).then(data => {
            // .filter(arr => arr[0] !== '')
            const results = data.map(mapFn);
            resolve(results);
          })
    })
  })
}

export const addRegistryItem = (contract, data) => {
  return new Promise((resolve, reject) => {
    const args = [...data];
    contract.entryCreationFee.call((e, data) => {
      args.push({
        value: data
      })

      args.push(function(e, r){
        if (e) {
          reject(e)
        } else {
          resolve(r);
        }
      });
      contract.createEntry.apply(contract, args);   
    });
  })
}

export { getWeb3, generateContractCode };

const IPFS = require('ipfs-api');

//require('ipfs-api/dist/index.min.js')
//require('ipfs-api');

export const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });


export const saveInIPFS = (jsonStr) => {
  return new Promise((resolve, reject) => {
    const buffer = Buffer.from(JSON.stringify(jsonStr));
      ipfs.add(buffer, (err, ipfsHash) => {
        if (err) {
          reject(err);
        } else {
          const hash = ipfsHash[0].path;
          resolve(hash)
        }
      })
  })
}


