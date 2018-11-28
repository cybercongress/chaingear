const chai = require("chai");
const BN = require("bn.js");
const bnChai = require("bn-chai");
const expect = chai.expect;

chai.use(bnChai(BN));
chai.use(require('chai-as-promised'));
chai.should();

const Chaingear = artifacts.require("Chaingear");
const RegistryBuilder = artifacts.require("RegistryBuilder");
const Registry = artifacts.require("Registry");
const Schema = artifacts.require("TeamSchema");

contract("Chaingear", (accounts) => {

    let chaingear;
    let builde;

    const CHAINGEAR_OWNER = accounts[0]
    const RANDOM_CREATOR_1 = accounts[3]
    const RANDOM_CREATOR_2 = accounts[4]
    const UNKNOWN = accounts[5]
    
    const CHAINGEAR_BENEFICIARY_1 = accounts[0]
    const CHAINGEAR_BENEFICIARY_2 = accounts[1]
    const CHAINGEAR_BENEFICIARIES = [CHAINGEAR_BENEFICIARY_1, CHAINGEAR_BENEFICIARY_2]
    
    const CHAINGEAR_BENEFICIARY_1_SHARES = 50;
    const CHAINGEAR_BENEFICIARY_2_SHARES = 100;
    const CHAINGEAR_BENEFICIARIES_SHARES = [CHAINGEAR_BENEFICIARY_1_SHARES, CHAINGEAR_BENEFICIARY_2_SHARES]
    
    const CHAINGEAR_DESCRIPTION = "THE MOST EXPENSIVE METAREGISTRY"
    const CHAINGEAR_NAME = "CHAINGEAR"
    const CHAINGEAR_SYMBOL = "CHG"
    
    const BUILDING_FEE = web3.utils.toWei(new BN(1), 'ether');
    // const CREATION_FEE_EQUAL = 1000000
    // const CREATION_FEE_NOT_EQUAL = 100
    // const CREATION_GAS = 7000000
    
    // const REGISTRY_FUNDING = 10000000
    
    const REGISTRY_CREATOR_1_VERSION = "V1"
    // const NOT_EXISTED_REGISTRY_CREATOR_VERSION = "HELLO_WORLD"
    const REGISTRY_CREATOR_1_ABI_LINK = "QmS2F1UgmYHAekcvezFLCrBibEBjJezSDqwq8fuwF5Qqvi"
    const REGISTRY_CREATOR_1_DESCRIPTION = "Basic version of registry"
    
    const REGISTRY_NAME_1 = "Test Registry";
    const REGISTRY_SYMBOL_1 = "TREG";

    before(async () => {
        
        builder = await RegistryBuilder.new({ from: CHAINGEAR_OWNER })
        
        chaingear = await Chaingear.new(
            CHAINGEAR_NAME,
            CHAINGEAR_SYMBOL,
            CHAINGEAR_BENEFICIARIES,
            CHAINGEAR_BENEFICIARIES_SHARES,
            CHAINGEAR_DESCRIPTION,
            BUILDING_FEE,
            { from: CHAINGEAR_OWNER }
        );

        await builder.setChaingearAddress(
            chaingear.address, 
            { from: CHAINGEAR_OWNER }
        );
            
        await chaingear.addRegistryBuilderVersion(
            REGISTRY_CREATOR_1_VERSION,
            builder.address,
            REGISTRY_CREATOR_1_ABI_LINK,
            REGISTRY_CREATOR_1_DESCRIPTION,
            { from: CHAINGEAR_OWNER }
        );
            
    })
    
    context("when deployed", () => {
        // it("should accept payments", async () => {
        //     await chaingear.sendTransaction({ value: 1, from: CHAINGEAR_OWNER });
        //     (await web3.eth.getBalance(chaingear.address)).should.be.bignumber.equal(1);
        // });
        
        it("name should equal", async() => {
            (await chaingear.name()).should.equal(CHAINGEAR_NAME);
        });

        it("token symbol should equal", async() => {
            (await chaingear.symbol()).should.equal(CHAINGEAR_SYMBOL);
        });
        
        it("should have registration fee", async () => {
            ((await chaingear.getRegistrationFee()).toNumber()).should.be.bignumber.equal(CREATION_FEE_EQUAL);
        });
        
        it("should have description", async () => {
            (await chaingear.getDescription()).should.be.equal(CHAINGEAR_DESCRIPTION);
        });
        
        it("should have safe", async () => {
            (await chaingear.getSafe()).should.be.not.equal(ZERO_ADDRESS);
        });
        
        // it("safe should have zero balance", async () => {
        // 
        //     (await web3.eth.getBalance(await chaingear.getSafe())).should.be.bignumber.equal(0);
        // });
        
        it("should have payees", async () => {
            for (var i = 0; i < CHAINGEAR_BENEFICIARIES.length; i++) {
                (await chaingear.payees(i)).should.be.equal(CHAINGEAR_BENEFICIARIES[i]);
            }
        });
        
        it("payess should have shares", async () => {
            for (var i = 0; i < CHAINGEAR_BENEFICIARIES_SHARES.length; i++) {
                (await chaingear.shares(CHAINGEAR_BENEFICIARIES[i])).toNumber().should.be.bignumber.equal(CHAINGEAR_BENEFICIARIES_SHARES[i]);
            }
        });
        
        // it("should be erc721", async () => {
        // });
        
        it("should have a name", async () => {
            (await chaingear.name()).should.be.equal(CHAINGEAR_NAME);
        });
        
        it("should have a symbol", async () => {
            (await chaingear.symbol()).should.be.equal(CHAINGEAR_SYMBOL);
        });
        
        it("should have zero token supply", async () => {
            (await chaingear.totalSupply()).toNumber().should.be.bignumber.equal(0);
        });
        
        it("shoud be not paused", async () => {
            (await chaingear.paused()).should.be.equal(false);
        });
        
        // it("should support interfaces ", async () => {
        // });
        
        it("should allow owner to update registration fee when paused", async () => {
            await chaingear.pause({ from: CHAINGEAR_OWNER });
            await chaingear.updateRegistrationFee(2*CREATION_FEE_EQUAL, { from: CHAINGEAR_OWNER });
            ((await chaingear.getRegistrationFee()).toNumber()).should.be.bignumber.equal(2*CREATION_FEE_EQUAL);
            await chaingear.unpause({ from: CHAINGEAR_OWNER });
        });
        
        // it("should allow owner to update description ", async () => {
        //     await chaingear.updateDescription("42", { from: CHAINGEAR_OWNER });
        //     (await chaingear.getDescription()).should.be.equal("42");
        // });
    })

    // it("#1/1 should allow anyone to build new registry with right fee and existed registry version", async () => {
    // 
    //     const entriesAmountBefore = await chaingear.totalSupply()
    // 
    //     const result = await chaingear.registerRegistry.call(
    //         REGISTRY_CREATOR_1_VERSION,
    //         [RANDOM_CREATOR_1],
    //         [100],
    //         REGISTRY_NAME_1,
    //         REGISTRY_SYMBOL_1,
    //         { 
    //             from: RANDOM_CREATOR_1,
    //             value: CREATION_FEE_EQUAL,
    //             gas: CREATION_GAS 
    //         }
    //     );
    // 
    //     await chaingear.registerRegistry(
    //         REGISTRY_CREATOR_1_VERSION,
    //         [RANDOM_CREATOR_1],
    //         [100],
    //         REGISTRY_NAME_1,
    //         REGISTRY_SYMBOL_1,
    //         { 
    //             from: RANDOM_CREATOR_1,
    //             value: CREATION_FEE_EQUAL,
    //             gas: CREATION_GAS 
    //         }
    //     );
    // 
    //     const entriesAmountAfter = await chaingear.totalSupply()
    //     entriesAmountAfter.toNumber().should.equal(entriesAmountBefore.toNumber()+1);
    // 
    //     const registry = await Registry.at(result[0])
    // 
    //     const name = await registry.name()
    //     name.should.equal(REGISTRY_NAME_1)
    // 
    //     const registryAdmin = await registry.getAdmin()
    //     registryAdmin.should.equal(RANDOM_CREATOR_1)
    // 
    //     const registryOwner = await registry.owner()
    //     registryOwner.should.equal(chaingear.address)
    // 
    // })
    // 
    // it("#1/2 should not allow anyone to build new registry with wrong fee and existed registry version", async () => {
    // 
    //     await chaingear.registerRegistry(
    //         REGISTRY_CREATOR_1_VERSION,
    //         [RANDOM_CREATOR_1],
    //         [100],
    //         REGISTRY_NAME_1,
    //         REGISTRY_SYMBOL_1,
    //         { 
    //             from: RANDOM_CREATOR_1,
    //             value: CREATION_FEE_NOT_EQUAL,
    //             gas: CREATION_GAS 
    //         }
    //     ).should.be.rejected
    // 
    // })
    // 
    // it("#1/3 should not allow anyone to build new registry with right fee and not existed registry version", async () => {
    // 
    //     await chaingear.registerRegistry(
    //         NOT_EXISTED_REGISTRY_CREATOR_VERSION,
    //         [RANDOM_CREATOR_1],
    //         [100],
    //         REGISTRY_NAME_1,
    //         REGISTRY_SYMBOL_1,
    //         { 
    //             from: RANDOM_CREATOR_1,
    //             value: CREATION_FEE_EQUAL,
    //             gas: CREATION_GAS 
    //         }
    //     ).should.be.rejected
    // 
    // })
    // 
    // it("#3/2 should allow registry_admin/token_owner to initialize registry", async () => {
    // 
    //     var ID = await chaingear.tokenOfOwnerByIndex(RANDOM_CREATOR_1, 0)
    // 
    //     const registryInfo = await chaingear.readRegistry(ID.toNumber())
    //     const registryAddress = registryInfo[2]
    // 
    //     const registry = await Registry.at(registryAddress)
    // 
    //     const registryInitializedBefore = await registry.getRegistryInitStatus();
    //     const registryEntryBaseBefore = await registry.getEntriesStorage()
    // 
    //     const registryEntryCoreAddress = await registry.initializeRegistry(
    //         "Q_ABI_HASH",
    //         EntryCore.bytecode,
    //         {
    //             from: RANDOM_CREATOR_1
    //         }
    //     )
    //     const registryInitializedAfter = await registry.getRegistryInitStatus();
    //     registryInitializedBefore.should.not.equal(registryInitializedAfter)
    // 
    //     const registryEntryBaseAfter = await registry.getEntriesStorage()
    //     registryEntryBaseBefore.should.not.equal(registryEntryBaseAfter)
    // 
    // })
    // 
    // it("#3/3 should allow registry_admin/token_owner to transfer tokenized ownership", async () => {
    // 
    //     const ID = await chaingear.tokenOfOwnerByIndex(RANDOM_CREATOR_1, 0)
    // 
    //     const registryInfo = await chaingear.readRegistry(ID.toNumber())
    //     const registryAddress = await registryInfo[2]
    // 
    //     const registry = await Registry.at(registryAddress)
    // 
    //     await chaingear.transferFrom(
    //         RANDOM_CREATOR_1,
    //         RANDOM_CREATOR_2,
    //         ID.toNumber(),
    //         {
    //             from: RANDOM_CREATOR_1
    //         }
    //     )
    // 
    //     const registryAdmin = await registry.getAdmin()
    //     registryAdmin.should.be.equal(RANDOM_CREATOR_2)
    // 
    //     const ID_2 = await chaingear.tokenOfOwnerByIndex(RANDOM_CREATOR_2, 0)
    //     ID_2.toNumber().should.be.equal(ID.toNumber())
    // 
    // })
    // 
    // it("#3/4 should not allow unknown to transfer tokenized ownership for any registry", async () => {
    // 
    //     var ID = await chaingear.tokenOfOwnerByIndex(RANDOM_CREATOR_2, 0)
    // 
    //     const registryInfo = await chaingear.readRegistry(ID.toNumber())
    //     const registryAddress = registryInfo[2]
    // 
    //     const registry = await Registry.at(registryAddress)
    // 
    //     await chaingear.transferFrom(
    //         RANDOM_CREATOR_2,
    //         UNKNOWN,
    //         ID.toNumber(),
    //         {
    //             from: UNKNOWN
    //         }
    //     ).should.be.rejected
    // 
    // })
    // 
    // it("#4/1 should allow chaingear owner to add registry version to chaingear", async () => {
    // 
    //     const builder = await RegistryBuilder.new({ from: CHAINGEAR_OWNER })
    // 
    //     await chaingear.addRegistryBuilderVersion(
    //         "V_TEST",
    //         builder.address,
    //         "Q_HASH",
    //         "THIS_IS_IT",
    //         {
    //             from: CHAINGEAR_OWNER 
    //         })
    // 
    //     const newRegistryCreationVersionHash = await chaingear.getRegistryBuilder("V_TEST")
    //     newRegistryCreationVersionHash[1].should.be.equal("Q_HASH")
    // 
    // })
    // 
    // it("#4/2 should not allow unknown to add registry version to chaingear", async () => {
    // 
    //     await chaingear.addRegistryBuilderVersion(
    //         "V_TEST",
    //         "0x2",
    //         "Q_HASH",
    //         "THIS_IS_IT",
    //         {from: UNKNOWN}
    //     ).should.be.rejected
    // 
    // })
    // 
    // it("#5/1 should allow chaingear owner to change registration fee", async () => {
    //     await chaingear.pause({from: CHAINGEAR_OWNER})
    // 
    //     await chaingear.updateRegistrationFee(7777777, {from: CHAINGEAR_OWNER})
    // 
    //     await chaingear.unpause({from: CHAINGEAR_OWNER})
    // 
    //     const newRegistrationFee = await chaingear.getRegistrationFee()
    //     newRegistrationFee.toNumber().should.be.equal(7777777)
    // })
    // 
    // it("#5/2 should not allow unknown to change registration fee", async () => {
    // 
    //     await chaingear.updateRegistrationFee(88888888, {from: UNKNOWN}
    //     ).should.be.rejected
    // 
    // })
    // 
    // it("#6/1 should allow chaingear owner to change description", async () => {
    // 
    //     await chaingear.updateDescription(
    //         "MOST AWESOME REGISTRY",
    //         {from: CHAINGEAR_OWNER}
    //     )
    // 
    //     const newChaingearDescription = await chaingear.getDescription()
    //     newChaingearDescription.should.be.equal("MOST AWESOME REGISTRY")
    // })
    // 
    // it("#6/2 should not allow unknown to change description", async () => {
    // 
    //     await chaingear.updateDescription(
    //         "MOST USELESSNESS REGISTRY",
    //         {from: UNKNOWN}
    //     ).should.be.rejected
    // 
    // })
    // 
    // it("#7/1 funds from funded registry should be transfered to RegistrySafe", async () => {
    // 
    //     const registrySafeBalanceBefore = await chaingear.getSafeBalance()
    // 
    //     var ID = await chaingear.tokenOfOwnerByIndex(RANDOM_CREATOR_2, 0)
    // 
    //     await chaingear.fundRegistry(
    //         ID.toNumber(),
    //         {
    //             from: RANDOM_CREATOR_1,
    //             value: REGISTRY_FUNDING
    //         }
    //     )
    // 
    //     const registrySafeBalanceAfter = await chaingear.getSafeBalance()
    //     const diff = registrySafeBalanceAfter.toNumber() - registrySafeBalanceBefore.toNumber()
    // 
    //     diff.should.be.equal(REGISTRY_FUNDING)
    // })
    // 
    // it("#7/2 owner of registry should can claim funds on balance of their Registry", async () => {
    // 
    //     const registrySafeBalanceBefore = await chaingear.getSafeBalance()
    // 
    //     const ID = await chaingear.tokenOfOwnerByIndex(RANDOM_CREATOR_2, 0)
    // 
    //     await chaingear.claimRegistryFunds(
    //         ID.toNumber(),
    //         REGISTRY_FUNDING,
    //         {
    //             from: RANDOM_CREATOR_2
    //         }
    //     )
    // 
    //     const registrySafeBalanceAfter = await chaingear.getSafeBalance()
    //     const diff = registrySafeBalanceBefore.toNumber() - registrySafeBalanceAfter.toNumber()
    //     diff.should.be.equal(REGISTRY_FUNDING)
    // })
    // 
    // it("#7/3 non-holder of registry token should not can claim tokens from registry balance", async () => {
    // 
    //     const ID = await chaingear.tokenOfOwnerByIndex(RANDOM_CREATOR_2, 0)
    // 
    //     await chaingear.claimRegistryFunds(
    //         ID.toNumber(),
    //         REGISTRY_FUNDING,
    //         {
    //             from: RANDOM_CREATOR_1
    //         }
    //     ).should.be.rejected
    // })
    // 
    // 
    // // TODO writes test for uniqueness of registry names/symbols
})
