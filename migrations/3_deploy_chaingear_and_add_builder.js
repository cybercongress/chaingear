var Chaingear = artifacts.require("./chaingear/Chaingear.sol");
var DatabaseBuilderV1 = artifacts.require("./builders/DatabaseBuilderV1.sol");
var DatabaseV1 = artifacts.require("./databases/DatabaseV1.sol");
var Safe = artifacts.require("./common/Safe.sol");

var AppsSchema = artifacts.require("./schemas/AppsSchema.sol");
var TeamSchema = artifacts.require("./schemas/TeamSchema.sol");
var NodesSchema = artifacts.require("./schemas/NodesSchema.sol");
var PortsSchema = artifacts.require("./schemas/PortsSchema.sol");
var FeaturesSchema = artifacts.require("./schemas/FeaturesSchema.sol");

var IPFS = require('ipfs-api');


module.exports = async function(deployer, network, accounts) {

    const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

    let ids;
    let databaseMeta;
    let hash; 
    let database;
    let BENEFICIARIES = ["0xE93984eC26Df9a71a094e3d159b4Ed05E6d73fb0"];
    let SHARES = [100];

    const builder = await DatabaseBuilderV1.deployed();
    const chaingear = await deployer.deploy(
        Chaingear,
        BENEFICIARIES,
        SHARES
    );
    await builder.setChaingearAddress(chaingear.address);
    hash = await ipfs.files.add(Buffer.from(JSON.stringify(DatabaseV1.abi)));
    console.log("CID to DatabaseV1 ABI in IPFS: ", hash[0].path);
    await chaingear.addDatabaseBuilderVersion(
        "V1",
        builder.address,
        hash[0].path,
        "Basic version of database"
    );
    
    const db = await deployer.deploy(
        DatabaseV1,
        BENEFICIARIES,
        SHARES,
        "verification-database",
        "VRFD"
    );
    
    const safe = await deployer.deploy(Safe);  
};
