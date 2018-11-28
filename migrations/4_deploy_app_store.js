var Chaingear = artifacts.require("./chaingear/Chaingear.sol");
var Registry = artifacts.require("./registry/Registry.sol");
var AppsSchema = artifacts.require("./schemas/AppsSchema.sol");
var IPFS = require('ipfs-api');


module.exports = async function(deployer, network, accounts) {

    const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

    let BUILDING_FEE, BENEFICIARIES, SHARES;
    // if (network === 'kovan' || network === 'infura') {
        BUILDING_FEE = 0
        BENEFICIARIES = []
        SHARES = []
    // } else {
    //     BUILDING_FEE = 100000
    //     BENEFICIARIES = [accounts[0], accounts[1]]
    //     SHARES = [50, 50]
    // }

    const chaingear = await Chaingear.deployed();
    // const results = await chaingear.registerRegistry.call(
    //     "V1",
    //     BENEFICIARIES,
    //     SHARES,
    //     "CYB Application Store",
    //     "APP",
    //     { value: BUILDING_FEE }
    // )
    // const registryAddress = results[0]
    // console.log("Registry Address >>>> ", registryAddress);
    await chaingear.registerRegistry(
        "V1",
        BENEFICIARIES,
        SHARES,
        "CYB Application Store",
        "APP",
        { value: BUILDING_FEE }
    )
    const hash = await ipfs.files.add(Buffer.from(JSON.stringify(AppsSchema.abi)));
    console.log("CID to ABI in IPFS >>>> ", hash[0].path);
    // const registry = await Registry.at(registryAddress);
    // await registry.initializeRegistry(hash[0].path, AppsSchema.bytecode);

};
