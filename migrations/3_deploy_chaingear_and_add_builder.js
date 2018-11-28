var Chaingear = artifacts.require("./chaingear/Chaingear.sol");
var RegistryBuilder = artifacts.require("./builder/RegistryBuilder.sol");
var Registry = artifacts.require("./registry/Registry.sol");
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
    //     BENEFICIARIES = [accounts[0]]
    //     SHARES = [50]
    // }

    const builder = await RegistryBuilder.deployed();
    const chaingear = await deployer.deploy(
        Chaingear,
        "CHAINGEAR",
        "CHG",
        BENEFICIARIES,
        SHARES,
        "The Most Expensive Registry",
        BUILDING_FEE
    );
    await builder.setChaingearAddress(chaingear.address);
    const hash = await ipfs.files.add(Buffer.from(JSON.stringify(Registry.abi)));
    console.log("CID to ABI in IPFS >>>> ", hash[0].path);
    await chaingear.addRegistryBuilderVersion(
        "V1",
        builder.address,
        hash[0].path,
        "Basic version of registry"
    );
};
