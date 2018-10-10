var Chaingear = artifacts.require("Chaingear");
var Registry = artifacts.require("Registry");
var NodesSchema = artifacts.require("NodesSchema");
var IPFS = require('ipfs-api');


module.exports = async function(deployer, network, accounts) {
    
    const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
    
    if (network == 'kovan') {
        BUILDING_FEE = 0
        BENEFICIARIES = []
        SHARES = []
    } else {
        BUILDING_FEE = 100000
        BENEFICIARIES = [accounts[0], accounts[1]]
        SHARES = [50, 50]
    }    
    
    const chaingear = await Chaingear.deployed();
    const results = await chaingear.registerRegistry.call(
        "V1",
        BENEFICIARIES,
        SHARES,
        "cybernodes Registry",
        "CYBERNODE",
        { value: BUILDING_FEE }
    )
    const registryAddress = results[0]
    await chaingear.registerRegistry(
        "V1",
        BENEFICIARIES,
        SHARES,
        "cybernodes Registry",
        "CYBERNODE",
        { value: BUILDING_FEE }
    )
    const hash = await ipfs.files.add(Buffer.from(JSON.stringify(NodesSchema.abi)));
    const registry = await Registry.at(registryAddress);
    await registry.initializeRegistry(hash[0].path, NodesSchema.bytecode);
    
};
