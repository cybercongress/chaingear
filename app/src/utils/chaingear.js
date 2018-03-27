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
    return getItems(contract, 'contractsLength', 'contracts', (items) => ({
      name: items[0],
      address: items[1],
      ipfsHash: items[2]
    }))
  })
}
