var Chaingear = artifacts.require("./chaingear/Chaingear.sol");
var DatabaseBuilderV1 = artifacts.require("./builders/DatabaseBuilderV1.sol");
var DatabaseV1 = artifacts.require("./databases/DatabaseV1.sol");

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
    let BENEFICIARIES = ["0x0000000000000000000000000000000000000000"];
    let SHARES = [100];
    let BUILDING_FEE = web3.utils.toWei('1', 'finney');  

    const builder = await DatabaseBuilderV1.deployed();
    const chaingear = await deployer.deploy(
        Chaingear,
        ["0x8D1D026637D323f72c80D0E6e322Bd760fc14BeE"],
        [100]
    );
    await builder.setChaingearAddress(chaingear.address);
    hash = await ipfs.files.add(Buffer.from(JSON.stringify(DatabaseV1.abi)));
    console.log("CID to DatabaseV1 ABI in IPFS: ", hash[0].path);
    await chaingear.addDatabaseBuilderVersion(
        "V1",
        builder.address,
        hash[0].path,
        "Basic version of registry"
    );
    
    if (network === 'development2') {
        console.log("Deployment of CYB Application Store Database");
        
        await chaingear.createDatabase(
            "V1",
            BENEFICIARIES,
            SHARES,
            "CYB Application Store",
            "APP",
            { value: BUILDING_FEE }
        )
        
        ids = await chaingear.getDatabasesIDs();
        databaseMeta = await chaingear.getDatabase(ids.slice(-1)[0].toNumber());
        
        hash = await ipfs.files.add(Buffer.from(JSON.stringify(AppsSchema.abi)));
        console.log("CID of AppsSchema ABI in IPFS >>>> ", hash[0].path);
        
        database = await DatabaseV1.at(databaseMeta[2]);
        await database.initializeDatabase(
            hash[0].path,
            AppsSchema.bytecode,
            {
                from: accounts[0]
            }
        );
        
        console.log("Deployment of cyber•Search Team Database");
        
        await chaingear.createDatabase(
            "V1",
            BENEFICIARIES,
            SHARES,
            "cyber•Search Team",
            "MEMBER",
            { value: BUILDING_FEE }
        )
        
        ids = await chaingear.getDatabasesIDs();
        databaseMeta = await chaingear.getDatabase(ids.slice(-1)[0].toNumber());
        
        hash = await ipfs.files.add(Buffer.from(JSON.stringify(TeamSchema.abi)));
        console.log("CID of TeamSchema ABI in IPFS >>>> ", hash[0].path);
        
        database = await DatabaseV1.at(databaseMeta[2]);
        await database.initializeDatabase(
            hash[0].path,
            TeamSchema.bytecode,
            {
                from: accounts[0]
            }
        );
        
        console.log("Deployment of cybernodes Database");
        
        await chaingear.createDatabase(
            "V1",
            BENEFICIARIES,
            SHARES,
            "cybernodes Registry",
            "CYBERNODE",
            { value: BUILDING_FEE }
        )
        
        ids = await chaingear.getDatabasesIDs();
        databaseMeta = await chaingear.getDatabase(ids.slice(-1)[0].toNumber());
        
        hash = await ipfs.files.add(Buffer.from(JSON.stringify(NodesSchema.abi)));
        console.log("CID of NodesSchema ABI in IPFS >>>> ", hash[0].path);
        
        database = await DatabaseV1.at(databaseMeta[2]);
        await database.initializeDatabase(
            hash[0].path,
            NodesSchema.bytecode,
            {
                from: accounts[0]
            }
        );
        
        console.log("Deployment of Ports Database");
        
        await chaingear.createDatabase(
            "V1",
            BENEFICIARIES,
            SHARES,
            "Ports Registry",
            "PORT",
            { value: BUILDING_FEE }
        )
        
        ids = await chaingear.getDatabasesIDs();
        databaseMeta = await chaingear.getDatabase(ids.slice(-1)[0].toNumber());
        
        hash = await ipfs.files.add(Buffer.from(JSON.stringify(PortsSchema.abi)));
        console.log("CID of PortsSchema ABI in IPFS >>>> ", hash[0].path);
        
        database = await DatabaseV1.at(databaseMeta[2]);
        await database.initializeDatabase(
            hash[0].path,
            PortsSchema.bytecode,
            {
                from: accounts[0]
            }
        );
        
        console.log("Deployment of CYB Features Database");
        
        await chaingear.createDatabase(
            "V1",
            BENEFICIARIES,
            SHARES,
            "CYB Features Registry",
            "FEATURE",
            { value: BUILDING_FEE }
        )
        
        ids = await chaingear.getDatabasesIDs();
        databaseMeta = await chaingear.getDatabase(ids.slice(-1)[0].toNumber());
        
        hash = await ipfs.files.add(Buffer.from(JSON.stringify(FeaturesSchema.abi)));
        console.log("CID of FeaturesSchema ABI in IPFS >>>> ", hash[0].path);
        
        database = await DatabaseV1.at(databaseMeta[2]);
        await database.initializeDatabase(
            hash[0].path,
            FeaturesSchema.bytecode,
            {
                from: accounts[0]
            }
        );
    }     
};
