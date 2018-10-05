var Chaingear = artifacts.require("./chaingear/Chaingear.sol");
var TeamSchema = artifacts.require("./schemas/TeamSchema.sol");
var Registry = artifacts.require("./registry/Registry.sol")

const IPFS = require('ipfs-api');

module.exports = function(deployer, network, accounts) {
    
    // const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
    // 
    // const saveInIPFS = (jsonStr) => {
    //   return new Promise((resolve, reject) => {
    //     const buffer = Buffer.from(JSON.stringify(jsonStr));
    //       ipfs.add(buffer, (err, ipfsHash) => {
    //         if (err) {
    //           reject(err);
    //         } else {
    //           const hash = ipfsHash[0].path;
    //           resolve(hash)
    //         }
    //       })
    //   })
    // }
    // 
    // var registry
    // 
    // if (network == 'kovan') {
    //     BUILDING_FEE = 0
    //     BENEFICIARIES = []
    //     SHARES = []
    // } else {
    //     BUILDING_FEE = 100000
    //     BENEFICIARIES = [accounts[0], accounts[1]]
    //     SHARES = [50, 50]
    // }    
    // 
    // Chaingear.deployed()
    // .then(chaingear => {
    //     chaingear.registerRegistry(
    //         "V1",
    //         BENEFICIARIES,
    //         SHARES,
    //         "cyber•Search Team",
    //         "CST",
    //         {
    //             value: BUILDING_FEE
    //         }
    //     )
    // })
    // .then((registryAddress, tokenIDs) => {
    //     registry = Registry.at(registryAddress)
    // })
    // .then(() => {
    //     saveInIPFS(AppsSchema.abi)
    // })
    // .then((hash) => {
    //     registry.initializeRegistry(hash, TeamSchema.bytecode)
    // })
    
};
