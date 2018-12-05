const chai = require("chai");
const bnChai = require("bn-chai");
const expect = chai.expect;

chai.use(bnChai(web3.utils.BN));
chai.use(require('chai-as-promised'));
chai.should();

const {toWei, toBN, fromWei, BN} = web3.utils;

const Chaingear = artifacts.require("Chaingear");
const DatabaseBuilderV1 = artifacts.require("DatabaseBuilderV1");
const DatabaseV1 = artifacts.require("DatabaseV1");

contract("Chaingear", (accounts) => {

    let chaingear;
    let builder;
    
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

    const CHAINGEAR_OWNER = accounts[0]
    const RANDOM_CREATOR_1 = accounts[3]
    const RANDOM_CREATOR_2 = accounts[4]
    const UNKNOWN = accounts[5]
    
    const CHAINGEAR_BENEFICIARY_1 = accounts[0]
    const CHAINGEAR_BENEFICIARY_2 = accounts[1]
    const CHAINGEAR_BENEFICIARIES = [CHAINGEAR_BENEFICIARY_1, CHAINGEAR_BENEFICIARY_2]
    
    const CHAINGEAR_BENEFICIARY_1_SHARES = toBN('50');
    const CHAINGEAR_BENEFICIARY_2_SHARES = toBN('100');
    const CHAINGEAR_BENEFICIARIES_SHARES = [CHAINGEAR_BENEFICIARY_1_SHARES, CHAINGEAR_BENEFICIARY_2_SHARES]
    
    const CHAINGEAR_DESCRIPTION = "The novel Ethereum database framework"
    const CHAINGEAR_NAME = "CHAINGEAR"
    const CHAINGEAR_SYMBOL = "CHG"
    
    const BUILDING_FEE = toWei(toBN(1), 'finney');
    
    const DATABASE_BUILDER_1_VERSION = "V1"
    const DATABASE_BUILDER_1_ABI_LINK = "QmS2F1UgmYHAekcvezFLCrBibEBjJezSDqwq8fuwF5Qqvi"
    const DATABASE_BUILDER_1_DESCRIPTION = "Basic version of registry"
    
    const DATABASE_NAME_0 = "Test Registry";
    const DATABASE_SYMBOL_0 = "TREG";

    before(async () => {
        
        builder = await DatabaseBuilderV1.new({ from: CHAINGEAR_OWNER });
        
        chaingear = await Chaingear.new(
            CHAINGEAR_BENEFICIARIES, CHAINGEAR_BENEFICIARIES_SHARES, { from: CHAINGEAR_OWNER }
        );

        await builder.setChaingearAddress(
            chaingear.address, { from: CHAINGEAR_OWNER }
        );    
    })
    
    describe("when deployed", () => {
        it("should accept payments", async () => {
            let payment = toWei('1', 'ether');
            await chaingear.sendTransaction({ value: payment, from: UNKNOWN });
            expect(await web3.eth.getBalance(chaingear.address)).to.eq.BN(payment)
        });
        
        it("name should equal", async() => {
            (await chaingear.name()).should.equal(CHAINGEAR_NAME);
        });

        it("token symbol should equal", async() => {
            (await chaingear.symbol()).should.equal(CHAINGEAR_SYMBOL);
        });
        
        it("should have registration fee", async () => {
            expect(await chaingear.getCreationFeeWei()).to.eq.BN(BUILDING_FEE);
        });
        
        it("should have description", async () => {
            (await chaingear.getChaingearDescription()).should.be.equal(CHAINGEAR_DESCRIPTION);
        });
        
        it("should have safe", async () => {
            (await chaingear.getSafeAddress()).should.be.not.equal(ZERO_ADDRESS);
        });
        
        it("safe should have zero balance", async () => {
            expect(await web3.eth.getBalance(await chaingear.getSafeAddress())).to.eq.BN(toBN('0'));
        });
        
        it("should have payees", async () => {
            for (var i = 0; i < CHAINGEAR_BENEFICIARIES.length; i++) {
                (await chaingear.payees(i)).should.be.equal(CHAINGEAR_BENEFICIARIES[i]);
            }
        });
        
        it("payess should have shares", async () => {
            for (var i = 0; i < CHAINGEAR_BENEFICIARIES_SHARES.length; i++) {
                expect(await chaingear.shares(CHAINGEAR_BENEFICIARIES[i])).to.eq.BN(CHAINGEAR_BENEFICIARIES_SHARES[i]);
            }
        });
        
        it("should have zero token supply", async () => {
            expect(await chaingear.totalSupply()).to.eq.BN(toBN('0'));
        });
        
        it("shoud be not paused", async () => {
            (await chaingear.paused()).should.be.equal(false);
        });
        
        it("should allow owner to update registration fee when paused", async () => {
            await chaingear.pause({ from: CHAINGEAR_OWNER });
            await chaingear.updateCreationFee(BUILDING_FEE.mul(toBN('2')), { from: CHAINGEAR_OWNER });
            expect(await chaingear.getCreationFeeWei()).to.eq.BN(BUILDING_FEE.mul(toBN('2')));
            await chaingear.unpause({ from: CHAINGEAR_OWNER });
            
            await chaingear.pause({ from: CHAINGEAR_OWNER });
            await chaingear.updateCreationFee(BUILDING_FEE, { from: CHAINGEAR_OWNER });
            expect(await chaingear.getCreationFeeWei()).to.eq.BN(BUILDING_FEE);
            await chaingear.unpause({ from: CHAINGEAR_OWNER });
        });
    })
    
    describe("when adding database builder", () => {
        it("should allow owner to add builder", async () => {
            await chaingear.addDatabaseBuilderVersion(
                DATABASE_BUILDER_1_VERSION,
                builder.address,
                DATABASE_BUILDER_1_ABI_LINK,
                DATABASE_BUILDER_1_DESCRIPTION,
                { from: CHAINGEAR_OWNER }
            ).should.be.fulfilled;
            
            expect(await chaingear.getAmountOfBuilders()).to.eq.BN(toBN('1'));
            (await chaingear.getBuilderById(0)).should.be.equal(DATABASE_BUILDER_1_VERSION);
            
            let databaseBuilder = await chaingear.getDatabaseBuilder(DATABASE_BUILDER_1_VERSION);
            (databaseBuilder[0]).should.be.equal(builder.address);
            (databaseBuilder[1]).should.be.equal(DATABASE_BUILDER_1_ABI_LINK);
            (databaseBuilder[2]).should.be.equal(DATABASE_BUILDER_1_DESCRIPTION);
        });
        
        it("should not allow owner to add builders with existed version", async () => {
            await chaingear.addDatabaseBuilderVersion(
                DATABASE_BUILDER_1_VERSION,
                builder.address,
                DATABASE_BUILDER_1_ABI_LINK,
                DATABASE_BUILDER_1_DESCRIPTION,
                { from: CHAINGEAR_OWNER }
            ).should.be.rejected;
        });
        
        it("should allow owner to update builder description", async () => {
            let newDescription = "42"
            await chaingear.updateDatabaseBuilderDescription(
                DATABASE_BUILDER_1_VERSION,
                newDescription,
                { from: CHAINGEAR_OWNER }
            ).should.be.fulfilled;
            
            let databaseBuilder = await chaingear.getDatabaseBuilder(DATABASE_BUILDER_1_VERSION);
            (databaseBuilder[2]).should.be.equal(newDescription);
        });
        
        it("should not allow owner to add non-contract builder", async () => {
            await chaingear.addDatabaseBuilderVersion(
                DATABASE_BUILDER_1_VERSION,
                ZERO_ADDRESS,
                DATABASE_BUILDER_1_ABI_LINK,
                DATABASE_BUILDER_1_DESCRIPTION,
                { from: CHAINGEAR_OWNER }
            ).should.be.rejected;
        });
        
        it("should not allow non-owner to add builder", async () => {
            await chaingear.addDatabaseBuilderVersion(
                DATABASE_BUILDER_1_VERSION,
                builder.address,
                DATABASE_BUILDER_1_ABI_LINK,
                DATABASE_BUILDER_1_DESCRIPTION,
                { from: UNKNOWN }
            ).should.be.rejected;
        });
    })
    
    describe("when creating database", () => {
        it("should allow to create database of existed version with expected creation fee", async () => {
            await chaingear.createDatabase(
                DATABASE_BUILDER_1_VERSION,
                [RANDOM_CREATOR_1],
                [100],
                DATABASE_NAME_0,
                DATABASE_SYMBOL_0,
                { 
                    from: RANDOM_CREATOR_1,
                    value: BUILDING_FEE,
                    gas: toBN('5000000')
                }
            ).should.be.fulfilled;
            expect(await chaingear.totalSupply()).to.eq.BN(toBN('1'));
            
            let databaseMeta = await chaingear.getDatabase(0);
            (databaseMeta[0]).should.be.equal(DATABASE_NAME_0);
            (databaseMeta[1]).should.be.equal(DATABASE_SYMBOL_0);
            (databaseMeta[3]).should.be.equal(DATABASE_BUILDER_1_VERSION);
            (databaseMeta[5]).should.be.equal(RANDOM_CREATOR_1);
            expect(databaseMeta[6]).to.eq.BN(toBN('0'));
            expect(await chaingear.getDatabaseIDByAddress(databaseMeta[2])).to.eq.BN(toBN('0'));
            expect((await chaingear.getDatabasesIDs())[0]).to.eq.BN(toBN('0'));
            (await chaingear.getNameExist(DATABASE_NAME_0)).should.be.equal(true);
            (await chaingear.getSymbolExist(DATABASE_SYMBOL_0)).should.be.equal(true);
            
            let database = await DatabaseV1.at(databaseMeta[2]);
            (await database.getAdmin()).should.be.equal(RANDOM_CREATOR_1);
            
        });
        
        // it("should allow admin to initialize", async () => {
        // });
    
        it("should not allow to create database of non-existed version", async () => {
            await chaingear.createDatabase(
                "RND",
                [RANDOM_CREATOR_1],
                [100],
                DATABASE_NAME_0,
                DATABASE_SYMBOL_0,
                { 
                    from: RANDOM_CREATOR_1,
                    value: BUILDING_FEE,
                    gas: toBN('5000000')
                }
            ).should.be.rejected;
        });
        
        it("should not allow to create database with non-expected creation fee", async () => {
            await chaingear.createDatabase(    
                DATABASE_BUILDER_1_VERSION,
                [RANDOM_CREATOR_1],
                [100],
                DATABASE_NAME_0,
                DATABASE_SYMBOL_0,
                { 
                    from: RANDOM_CREATOR_1,
                    value: toBN('0'),
                    gas: toBN('5000000')
                }
            ).should.be.rejected;
        });
        
        it("should not allow to create database with existed name or/and symbol", async () => {
            await chaingear.createDatabase(
                DATABASE_BUILDER_1_VERSION,
                [RANDOM_CREATOR_1],
                [100],
                DATABASE_NAME_0,
                DATABASE_SYMBOL_0,
                { 
                    from: RANDOM_CREATOR_1,
                    value: BUILDING_FEE,
                    gas: toBN('5000000')
                }
            ).should.be.rejected;
        });
    })
    
    describe("when funding database", () => {
        it("should allow to fund database when not paused", async () => {
            let fund = toWei(toBN(1), 'ether');
            await chaingear.fundDatabase(0, 
                {
                    value: fund,
                    from: UNKNOWN
                }
            ).should.be.fulfilled;
            let databaseBalance = await chaingear.getDatabaseBalance(0);
            expect(databaseBalance[0]).to.eq.BN(fund);
            expect(databaseBalance[1]).to.eq.BN(fund);
            expect(await chaingear.getSafeBalance()).to.eq.BN(fund);
        });
    
        it("should not allow to fund database when not paused", async () => {            
            await chaingear.pause({ from: CHAINGEAR_OWNER });
            let fund = toWei(toBN(1), 'ether');
            await chaingear.fundDatabase(0, 
                {
                    value: fund,
                    from: UNKNOWN
                }
            ).should.be.rejected;
            await chaingear.unpause({ from: CHAINGEAR_OWNER });
        });
        
        it("should not allow to fund non-existed database", async () => {
            let fund = toWei(toBN(1), 'ether');
            await chaingear.fundDatabase(42, 
                {
                    value: fund,
                    from: UNKNOWN
                }
            ).should.be.rejected;
        });
    })
    
    describe("when claiming database's funds", () => {
        it("should not allow database admin claim more funds then funded", async () => {
            let claim = toWei(toBN(1), 'ether');
            await chaingear.claimDatabaseFunds(0, claim.mul(toBN('2')),
                {
                    from: RANDOM_CREATOR_1
                }
            ).should.be.rejected;
        });
        
        it("should not allow database admin claim their funds when paused", async () => {
            await chaingear.pause({ from: CHAINGEAR_OWNER });
            let claim = toWei(toBN(1), 'ether');
            await chaingear.claimDatabaseFunds(0, claim,
                {
                    from: RANDOM_CREATOR_1
                }
            ).should.be.rejected;
            await chaingear.unpause({ from: CHAINGEAR_OWNER });
        });
    
        it("should not allow database's non-admin claim funds", async () => {
            let claim = toWei(toBN(1), 'ether');
            await chaingear.claimDatabaseFunds(0, claim,
                {
                    from: UNKNOWN
                }
            ).should.be.rejected;
        });
        
        it("should allow database admin claim their funds when not paused", async () => {
            let claim = toWei(toBN(1), 'ether');
            let databaseBalance = await chaingear.getDatabaseBalance(0);
            expect(databaseBalance[0]).to.eq.BN(claim);
            expect(databaseBalance[1]).to.eq.BN(claim);
            await chaingear.claimDatabaseFunds(0, claim,
                {
                    from: RANDOM_CREATOR_1
                }
            ).should.be.fulfilled;
            databaseBalance = await chaingear.getDatabaseBalance(0);
            expect(databaseBalance[0]).to.eq.BN(toBN('0'));
            expect(databaseBalance[1]).to.eq.BN(claim);
            expect(await chaingear.getSafeBalance()).to.eq.BN(toBN('0'));
        });
    })
    
    describe("when transfering database adminship", () => {
        it("should not allow database's admin transfer adminship when paused", async () => {
            await chaingear.pause({ from: CHAINGEAR_OWNER });
            await chaingear.transferFrom(RANDOM_CREATOR_1, RANDOM_CREATOR_2, 0).should.be.rejected;
            await chaingear.unpause({ from: CHAINGEAR_OWNER });
        });
    
        it("should not allow database's non-admin transfer adminship", async () => {
            await chaingear.transferFrom(UNKNOWN, RANDOM_CREATOR_2, 0).should.be.rejected;
        });
        
        it("should allow database admin transfer adminship when not paused", async () => {
            await chaingear.transferFrom(RANDOM_CREATOR_1, RANDOM_CREATOR_2, 0, 
                {
                    from: RANDOM_CREATOR_1
                }
            ).should.be.fulfilled;
            let databaseMeta = await chaingear.getDatabase(0);
            (databaseMeta[5]).should.be.equal(RANDOM_CREATOR_2);
            
            let database = await DatabaseV1.at(databaseMeta[2]);
            (await database.getAdmin()).should.be.equal(RANDOM_CREATOR_2);
        });
    })

    
    describe("when deleting database", () => {
        it("should not allow non-owner delete database", async () => {
            await chaingear.deleteDatabase(0,
                {
                    from: UNKNOWN
                }
            ).should.be.rejected;
        });
        
        it("should allow owner delete his database", async () => {
            let databaseMeta = await chaingear.getDatabase(0);
            let database = await DatabaseV1.at(databaseMeta[2]);
            await chaingear.deleteDatabase(0,
                {
                    from: RANDOM_CREATOR_2
                }
            ).should.be.fulfilled;
            (await chaingear.getNameExist(DATABASE_NAME_0)).should.be.equal(false);
            (await chaingear.getSymbolExist(DATABASE_SYMBOL_0)).should.be.equal(false);
            expect(await chaingear.totalSupply()).to.eq.BN(toBN('0'));
            (await database.owner()).should.be.equal(RANDOM_CREATOR_2);
        });
    })
})
