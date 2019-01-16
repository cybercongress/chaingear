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
const Schema = artifacts.require("AppsSchema");

contract("DatabaseV1", (accounts) => {

    let chaingear;
    let builder;
    let database;
    let storage;
    
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    
    const CreateEntryPermissionGroup = {
        OnlyAdmin: 0,
        Whitelist: 1,
        AllUsers: 2
    }
    
    const CHAINGEAR_OWNER = accounts[0]
    const DATABASE_ADMIN = accounts[3]
    const UNKNOWN = accounts[5]
    const PIRATE = accounts[7]
    
    const DATABASE_BENEFICIARY_1 = accounts[3]
    const DATABASE_BENEFICIARY_2 = accounts[4]
    const DATABASE_BENEFICIARIES = [DATABASE_BENEFICIARY_1, DATABASE_BENEFICIARY_2]
    
    const DATABASE_BENEFICIARY_1_SHARES = toBN('50');
    const DATABASE_BENEFICIARY_2_SHARES = toBN('50');
    const DATABASE_BENEFICIARIES_SHARES = [DATABASE_BENEFICIARY_1_SHARES, DATABASE_BENEFICIARY_2_SHARES]
    
    const CHAINGEAR_BUILDING_FEE = toWei(toBN(1), 'finney');
    const CREATION_FEE = toWei(toBN(1), 'finney');
    const FUNDING = toWei(toBN(1), 'ether');
    
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
                DATABASE_BENEFICIARIES,
                DATABASE_BENEFICIARIES_SHARES,
                DATABASE_NAME,
                DATABASE_SYMBOL,
                { 
                    from: DATABASE_ADMIN,
                    value: CHAINGEAR_BUILDING_FEE
                }
            ).should.be.fulfilled;
        
        let databaseMeta = await chaingear.getDatabase(0);
        database = await DatabaseV1.at(databaseMeta[2]);
        expect(await database.getChaingearID()).to.eq.BN(toBN('0'));
    })
    
    describe("when deployed", () => {
        it("should accept payments", async () => {
            let payment = toWei('1', 'ether');
            await database.sendTransaction({ value: payment, from: UNKNOWN });
            expect(await web3.eth.getBalance(database.address)).to.eq.BN(payment)
        });

        it("name should equal", async() => {
            (await database.name()).should.equal(DATABASE_NAME);
        });

        it("token symbol should equal", async() => {
            (await database.symbol()).should.equal(DATABASE_SYMBOL);
        });

        it("should have creation fee", async () => {
            expect(await database.getEntryCreationFee()).to.eq.BN(toBN('0'));
        });

        it("should have description", async () => {
            (await database.getDatabaseDescription()).should.be.equal("");
        });

        it("should have safe", async () => {
            (await database.getDatabaseSafe()).should.be.not.equal(ZERO_ADDRESS);
        });

        it("safe should have zero balance", async () => {
            expect(await web3.eth.getBalance(await database.getDatabaseSafe())).to.eq.BN(toBN('0'));
        });

        it("should have payees", async () => {
            for (var i = 0; i < DATABASE_BENEFICIARIES.length; i++) {
                (await database.payees(i)).should.be.equal(DATABASE_BENEFICIARIES[i]);
            }
        });

        it("payess should have shares", async () => {
            for (var i = 0; i < DATABASE_BENEFICIARIES.length; i++) {
                expect(await database.shares(DATABASE_BENEFICIARIES[i])).to.eq.BN(DATABASE_BENEFICIARIES_SHARES[i]);
            }
        });

        it("should have zero token supply", async () => {
            expect(await database.totalSupply()).to.eq.BN(toBN('0'));
        });

        it("shoud be not paused", async () => {
            (await database.getPaused()).should.be.equal(false);
        });

        it("should allow admin to update creation fee when paused", async () => {
            await database.pause({ from: DATABASE_ADMIN });
            await database.updateEntryCreationFee(CREATION_FEE, { from: DATABASE_ADMIN });
            expect(await database.getEntryCreationFee()).to.eq.BN(CREATION_FEE);
            await database.unpause({ from: DATABASE_ADMIN });
        });
    })
    
    describe("when initializing database", () => {
        it("should not allow non-admin initialize database", async () => {
            await database.initializeDatabase("", Schema.bytecode, { from: UNKNOWN }).should.be.rejected;
        });
        
        it("should not allow admin corrupt database", async () => {
            await database.initializeDatabase("", "0x", { from: DATABASE_ADMIN }).should.be.rejected;
        });
        
        it("should allow admin initialize database", async () => {
            (await database.getDatabaseInitStatus()).should.be.equal(false);
            await database.initializeDatabase("", Schema.bytecode, { from: DATABASE_ADMIN }).should.be.fulfilled;
            (await database.getDatabaseInitStatus()).should.be.equal(true);
            
            await database.initializeDatabase("", Schema.bytecode, { from: DATABASE_ADMIN }).should.be.rejected;
            (await database.getEntriesStorage()).should.be.not.equal(ZERO_ADDRESS);
            storage = await Schema.at(await database.getEntriesStorage());
        });
    })
    
    describe("when creating entries", () => {
        it("should not allow non-admin to add entries", async () => {
            await database.createEntry({ value: CREATION_FEE, from: UNKNOWN }).should.be.rejected;
        });
        
        it("should not allow admin to add entries when paused", async () => {
            await database.pause({ from: DATABASE_ADMIN });
            await database.createEntry({ value: CREATION_FEE, from: DATABASE_ADMIN }).should.be.rejected;
            await database.unpause({ from: DATABASE_ADMIN });
        });
        
        it("should not allow admin to add entries with wrong creation fee", async () => {
            await database.createEntry({ value: toWei('1'), from: DATABASE_ADMIN }).should.be.rejected;
        });
        
        it("should allow admin to add entries", async () => {
            let databaseBalanceBefore = new BN(await web3.eth.getBalance(database.address));
            await database.createEntry({ value: CREATION_FEE, from: DATABASE_ADMIN }).should.be.fulfilled;
            expect(await database.totalSupply()).to.eq.BN(toBN('1'));
            let entryMeta = await database.readEntryMeta(0);
            (entryMeta[0]).should.be.equal(DATABASE_ADMIN);
            (entryMeta[1]).should.be.equal(DATABASE_ADMIN);
            let databaseBalanceAfter = new BN(await web3.eth.getBalance(database.address));
            expect(databaseBalanceAfter.sub(databaseBalanceBefore)).to.eq.BN(CREATION_FEE);
            (await database.getEntriesIDs()).length.should.be.equal(1);
            
            let entry = await storage.readEntry(0);
            (entry[0]).should.be.equal("");
            (entry[1]).should.be.equal("");
            (entry[2]).should.be.equal("");
            (entry[3]).should.be.equal("");
            (entry[4]).should.be.equal("");
            expect(entryMeta[3]).to.eq.BN(await latestTime());            
        });
        
        it("should allow admin to whitelist new address", async () => {
            await database.pause({ from: DATABASE_ADMIN });
            await database.updateCreateEntryPermissionGroup(CreateEntryPermissionGroup.Whitelist, 
                {
                    from: DATABASE_ADMIN
                }
            ).should.be.fulfilled;
            (await database.getRegistryPermissions()).toNumber().should.be.equal(CreateEntryPermissionGroup.Whitelist);
            (await database.checkWhitelisting(UNKNOWN)).should.be.equal(false);
            await database.addToWhitelist(UNKNOWN, { from: DATABASE_ADMIN }).should.be.fulfilled;
            (await database.checkWhitelisting(UNKNOWN)).should.be.equal(true);
            await database.unpause({ from: DATABASE_ADMIN });
        });
        
        it("should allow whitelisted unknown to add entries", async () => {
            let databaseBalanceBefore = new BN(await web3.eth.getBalance(database.address));
            await database.createEntry({ value: CREATION_FEE, from: UNKNOWN }).should.be.fulfilled;  
            expect(await database.totalSupply()).to.eq.BN(toBN('2'));
            let entryMeta = await database.readEntryMeta(1);
            (entryMeta[0]).should.be.equal(UNKNOWN);
            (entryMeta[1]).should.be.equal(UNKNOWN);
            let databaseBalanceAfter = new BN(await web3.eth.getBalance(database.address));
            expect(databaseBalanceAfter.sub(databaseBalanceBefore)).to.eq.BN(CREATION_FEE);
            (await database.getEntriesIDs()).length.should.be.equal(2);
        });
        
        it("should allow admin to set global access to add entries", async () => {
            await database.pause({ from: DATABASE_ADMIN });
            await database.updateCreateEntryPermissionGroup(CreateEntryPermissionGroup.AllUsers, 
                {
                    from: DATABASE_ADMIN
                }
            ).should.be.fulfilled;
            await database.unpause({ from: DATABASE_ADMIN });
            (await database.getRegistryPermissions()).toNumber().should.be.equal(CreateEntryPermissionGroup.AllUsers);
        });
        
        it("should allow unknown to add entries", async () => {
            let databaseBalanceBefore = new BN(await web3.eth.getBalance(database.address));
            await database.createEntry({ value: CREATION_FEE, from: PIRATE }).should.be.fulfilled;
            expect(await database.totalSupply()).to.eq.BN(toBN('3'));
            let entryMeta = await database.readEntryMeta(2);
            (entryMeta[0]).should.be.equal(PIRATE);
            (entryMeta[1]).should.be.equal(PIRATE);
            let databaseBalanceAfter = new BN(await web3.eth.getBalance(database.address));
            expect(databaseBalanceAfter.sub(databaseBalanceBefore)).to.eq.BN(CREATION_FEE);
            (await database.getEntriesIDs()).length.should.be.equal(3);
        });
    })
    
    describe("when funding entries", () => {
        it("should not allow to fund when paused", async () => {
            await database.pause({ from: DATABASE_ADMIN });
            await database.fundEntry(2, { value: FUNDING, from: PIRATE }).should.be.rejected;
            await database.unpause({ from: DATABASE_ADMIN });
        });
        
        it("should not allow to fund non-existed entry", async () => {
            await database.fundEntry(3, { value: FUNDING, from: PIRATE }).should.be.rejected;
        });
        
        it("should allow to fund entry", async () => {
            await database.fundEntry(2, { value: FUNDING, from: PIRATE }).should.be.fulfilled;
            await database.fundEntry(2, { value: FUNDING, from: UNKNOWN }).should.be.fulfilled;
            await database.fundEntry(2, { value: FUNDING, from: DATABASE_ADMIN }).should.be.fulfilled;
            let entryMeta = await database.readEntryMeta(2);
            expect(entryMeta[4]).to.eq.BN(FUNDING.mul(toBN('3')));
            expect(entryMeta[5]).to.eq.BN(FUNDING.mul(toBN('3')));
            expect(await web3.eth.getBalance(await database.getDatabaseSafe())).to.eq.BN(FUNDING.mul(toBN('3')));
        });
    })
    
    describe("when claiming entries funds", () => {
        it("should not allow non-owner of entry to claim funds", async () => {
            await database.claimEntryFunds(2, FUNDING, { from: UNKNOWN }).should.be.rejected;
        });
        
        it("should not allow owner of entry to claim funds when paused", async () => {
            await database.pause({ from: DATABASE_ADMIN });
            await database.claimEntryFunds(2, FUNDING, { from: PIRATE }).should.be.rejected;
            await database.unpause({ from: DATABASE_ADMIN });
        });
        
        it("should not allow owner of entry to claim funds more then funded", async () => {
            await database.claimEntryFunds(2, FUNDING.mul(toBN('10')), { from: PIRATE }).should.be.rejected;
        });
        
        it("should allow owner of entry to claim funds", async () => {
            await database.claimEntryFunds(2, FUNDING, { from: PIRATE }).should.be.fulfilled;
            let entryMeta = await database.readEntryMeta(2);
            expect(entryMeta[4]).to.eq.BN(FUNDING.mul(toBN('2')));
            expect(entryMeta[5]).to.eq.BN(FUNDING.mul(toBN('3')));
            expect(await web3.eth.getBalance(await database.getDatabaseSafe())).to.eq.BN(FUNDING.mul(toBN('2')));
        });
    })
    
    describe("when transfering entries", () => {
        it("should not allow non-owner of entry to transfer", async () => {
            await database.transferFrom(UNKNOWN, PIRATE, 2, { from: UNKNOWN }).should.be.rejected;
        });
        
        it("should not allow owner of entry to transfer when paused", async () => {
            await database.pause({ from: DATABASE_ADMIN });
            await database.transferFrom(PIRATE, UNKNOWN, 2, { from: PIRATE }).should.be.rejected;
            await database.unpause({ from: DATABASE_ADMIN });
        });
        
        it("should allow owner of entry to transfer entry", async () => {
            await database.transferFrom(PIRATE, UNKNOWN, 2, { from: PIRATE }).should.be.fulfilled;
            let entryMeta = await database.readEntryMeta(2);
            (entryMeta[0]).should.be.equal(UNKNOWN);
            (entryMeta[1]).should.be.equal(PIRATE);
        });
    })
    
    describe("when editing entries", () => {
        it("should not allow non-owner to update entry", async () => {
            await storage.updateEntry(2, "1", "1", "1", "1", "1", { from: PIRATE }).should.be.rejected;
        });
        
        it("should not allow owner to update entry when paused", async () => {
            await database.pause({ from: DATABASE_ADMIN });
            await storage.updateEntry(2, "1", "1", "1", "1", "1", { from: UNKNOWN }).should.be.rejected;
            await database.unpause({ from: DATABASE_ADMIN });
        });
        
        it("should allow owner to update entry", async () => {
            await storage.updateEntry(2, "1", "1", "1", "1", "1", { from: UNKNOWN }).should.be.fulfilled;
            let entry = await storage.readEntry(2);
            (entry[0]).should.be.equal("1");
            (entry[1]).should.be.equal("1");
            (entry[2]).should.be.equal("1");
            (entry[3]).should.be.equal("1");
            (entry[4]).should.be.equal("1");
            let entryMeta = await database.readEntryMeta(2);
            expect(entryMeta[3]).to.eq.BN(await latestTime());
        });
    })
    
    describe("when deleting entries", () => {
        it("should not allow non-owner to delete entry", async () => {
            await storage.deleteEntry(2, { from: PIRATE }).should.be.rejected;
        });
        
        it("should not allow owner to delete entry when paused", async () => {
            await database.pause({ from: DATABASE_ADMIN });
            await storage.deleteEntry(2, { from: UNKNOWN }).should.be.rejected;
            await database.unpause({ from: DATABASE_ADMIN });
        });
        
        it("should allow owner to delete entry", async () => {
            await database.claimEntryFunds(2, FUNDING.mul(toBN('2')), { from: UNKNOWN }).should.be.fulfilled;
            let entryMeta = await database.readEntryMeta(2);
            expect(entryMeta[4]).to.eq.BN(FUNDING.mul(toBN('0')));
            expect(entryMeta[5]).to.eq.BN(FUNDING.mul(toBN('3')));
            
            await database.deleteEntry(2, { from: UNKNOWN }).should.be.fulfilled;
            expect(await database.totalSupply()).to.eq.BN(toBN('2'));
            (await database.getEntriesIDs()).length.should.be.equal(2);
        });
    })
})
