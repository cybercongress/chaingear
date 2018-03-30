import getWeb3 from './getWeb3.js';

import ChaingearBuild from './Chaingear.json'
//'../../../smart-contracts/build/contracts/Chaingear.json'

// './Chaingear.json'

const getItems = (contract, count, array, mapFn) => {
  return new Promise(resolve => {
    contract[count]().then(lengthData => {
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

const getContract = () => {
  return getWeb3
      .then(results => {
      const contract = require('truffle-contract');
      const registryContract = contract(ChaingearBuild);
      registryContract.setProvider(results.web3.currentProvider);
      results.web3.eth.defaultAccount = results.web3.eth.accounts[0];
      return registryContract.deployed().then(contract => ({
        contract,
        web3: results.web3
      }));
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

export const getContracts = () => {
  return getContract().then(( { contract, web3 }) => {  
    return getItems(contract, 'registriesAmount', 'registries', (items) => {
      return ({
        name: items[0],
        address: items[1],
        ipfsHash: items[4]
      })

    })
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
      console.log(e, lengthData)
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

const IPFS = require('ipfs-api');

//require('ipfs-api/dist/index.min.js')
//require('ipfs-api');

export const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

