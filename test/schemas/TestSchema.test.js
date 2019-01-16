const chai = require("chai");
const bnChai = require("bn-chai");
const expect = chai.expect;

chai.use(bnChai(web3.utils.BN));
chai.use(require('chai-as-promised'));
chai.should();

const {toWei, toBN, fromWei, BN} = web3.utils;
const { latestTime } = require('openzeppelin-solidity/test/helpers/latestTime');

const Chaingear = artifacts.require("Chaingear");
const DatabaseBuilderV1 = artifacts.require("DatabaseBuilderV1");
const DatabaseV1 = artifacts.require("DatabaseV1");
const Schema = artifacts.require("TestSchema");

contract("TestSchema", (accounts) => {

    let chaingear;
    let builder;
    let database;
    let storage;
    
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    
    // const CreateEntryPermissionGroup = {
    //     OnlyAdmin: 0,
    //     Whitelist: 1,
    //     AllUsers: 2
    // }
    
    const CHAINGEAR_OWNER = accounts[0]
    const DATABASE_ADMIN = accounts[3]
    // const UNKNOWN = accounts[5]
    // const PIRATE = accounts[7]
    
    const CHAINGEAR_BUILDING_FEE = toWei(toBN(1), 'finney');
    // const CREATION_FEE = toWei(toBN(1), 'finney');
    // const FUNDING = toWei(toBN(1), 'ether');
    
    const DATABASE_BUILDER_VERSION = "V1"
    
    const DATABASE_NAME = "test-registry";
    const DATABASE_SYMBOL = "TREG";

    before(async () => {
        
        builder = await DatabaseBuilderV1.new({ from: CHAINGEAR_OWNER });
        
        chaingear = await Chaingear.new(
            [], [], { from: CHAINGEAR_OWNER }
        );
        
        await builder.setChaingearAddress(
            chaingear.address, { from: CHAINGEAR_OWNER }
        );
        
        await chaingear.addDatabaseBuilderVersion(
            DATABASE_BUILDER_VERSION,
            builder.address,
            "",
            "",
            { from: CHAINGEAR_OWNER }
        ).should.be.fulfilled;
        
        await chaingear.createDatabase(
                DATABASE_BUILDER_VERSION,
                [],
                [],
                DATABASE_NAME,
                DATABASE_SYMBOL,
                { 
                    from: DATABASE_ADMIN,
                    value: CHAINGEAR_BUILDING_FEE
                }
            ).should.be.fulfilled;
        
        let databaseMeta = await chaingear.getDatabase(0);
        database = await DatabaseV1.at(databaseMeta[2]);
        
        await database.initializeDatabase(
            "",
            Schema.bytecode,
            { from: DATABASE_ADMIN }
        ).should.be.fulfilled;
        
        storage = await Schema.at(await database.getEntriesStorage());
    })
    
    describe("when creating entries", () => {        
        it("should allow admin to add entries", async () => {
            await database.createEntry({ from: DATABASE_ADMIN }).should.be.fulfilled;
            await database.createEntry({ from: DATABASE_ADMIN }).should.be.fulfilled;
        });
    })
    
    describe("when editing entries", () => {
        it("should correctly check uniq when update", async () => {
            await storage.updateEntry(0, "Hello world", "0xe96e14a641FF16024668018e5cc70A3bCF6b3631", 1, -1, { from: DATABASE_ADMIN }).should.be.fulfilled;
            await storage.updateEntry(0, "Hello world", "0x166029Ee722dDAD7279C8d61edD4986DA71d2C0F", 2, -2, { from: DATABASE_ADMIN }).should.be.rejected;
            await storage.updateEntry(0, "HelloWorld", "0xe96e14a641FF16024668018e5cc70A3bCF6b3631", 2, -2, { from: DATABASE_ADMIN }).should.be.rejected;
            await storage.updateEntry(0, "HelloWorld", "0x166029Ee722dDAD7279C8d61edD4986DA71d2C0F", 1, -2, { from: DATABASE_ADMIN }).should.be.rejected;
            await storage.updateEntry(0, "HelloWorld", "0x166029Ee722dDAD7279C8d61edD4986DA71d2C0F", 2, -1, { from: DATABASE_ADMIN }).should.be.rejected;
            await storage.updateEntry(0, "HelloWorld", "0x166029Ee722dDAD7279C8d61edD4986DA71d2C0F", 2, -2, { from: DATABASE_ADMIN }).should.be.fulfilled;
            await storage.updateEntry(0, "Hello world", "0x166029Ee722dDAD7279C8d61edD4986DA71d2C0F", 2, -2, { from: DATABASE_ADMIN }).should.be.rejected;
            await storage.updateEntry(0, "HelloWorld", "0xe96e14a641FF16024668018e5cc70A3bCF6b3631", 2, -2, { from: DATABASE_ADMIN }).should.be.rejected;
            await storage.updateEntry(0, "HelloWorld", "0x166029Ee722dDAD7279C8d61edD4986DA71d2C0F", 1, -2, { from: DATABASE_ADMIN }).should.be.rejected;
            await storage.updateEntry(0, "HelloWorld", "0x166029Ee722dDAD7279C8d61edD4986DA71d2C0F", 2, -1, { from: DATABASE_ADMIN }).should.be.rejected;
            await storage.updateEntry(0, "Hello world", "0xe96e14a641FF16024668018e5cc70A3bCF6b3631", 1, -1, { from: DATABASE_ADMIN }).should.be.fulfilled;
        });
    })
    
    describe("when deleting entries", () => {        
        it("should correctly clear uniq index when delete", async () => {
            await storage.updateEntry(1, "Hello world", "0xe96e14a641FF16024668018e5cc70A3bCF6b3631", 1, -1, { from: DATABASE_ADMIN }).should.be.rejected;
            await database.deleteEntry(0, { from: DATABASE_ADMIN }).should.be.fulfilled;
            await storage.updateEntry(1, "Hello world", "0xe96e14a641FF16024668018e5cc70A3bCF6b3631", 1, -1, { from: DATABASE_ADMIN }).should.be.fulfilled;
        });
    })
})
