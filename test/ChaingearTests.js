const BigNumber = require("bignumber.js")
const chai = require("chai")
chai.use(require("chai-bignumber")())
chai.use(require("chai-as-promised"))
chai.should()

const Registry = artifacts.require("Registry")
const Chaingear = artifacts.require("Chaingear")
const RegistryCreator = artifacts.require("RegistryCreator")

contract("Chaingear", (accounts) => {

    const PermissionTypeEntries = {
        OnlyAdmin: 0,
        AllUsers: 1
    }

    let chaingear, creator

    const CHAINGEAR_OWNER = accounts[0]
    const CHAINGEAR_BENEFICIARY_1 = accounts[0]
    const CHAINGEAR_BENEFICIARY_2 = accounts[1]
    
    const CHAINGEAR_BENEFICIARY_1_SHARES = 50;
    const CHAINGEAR_BENEFICIARY_2_SHARES = 100;
    
    const RANDOM_CREATOR_1 = accounts[3]
    const RANDOM_CREATOR_2 = accounts[4]
    const UNKNOWN = accounts[5]
    
    const CHAINGEAR_BENEFICIARIES = [CHAINGEAR_BENEFICIARY_1, CHAINGEAR_BENEFICIARY_2]
    const CHAINGEAR_BENEFICIARIES_SHARES = [CHAINGEAR_BENEFICIARY_1_SHARES, CHAINGEAR_BENEFICIARY_2_SHARES]
    
    const CHAINGEAR_DESCRIPTION = "MOST EXPENSIVE REGISTRY"
    const CHAINGEAR_NAME = "CHAINGEAR"
    const CHAINGEAR_SYMBOL = "CHG"
    
    const BUILDING_FEE = 1000000
    const CREATION_FEE_EQUAL = 1000000
    const CREATION_FEE_NOT_EQUAL = 100
    const CREATION_GAS = 7000000
    
    const REGISTRY_CREATOR_1_VERSION = "V1.0"
    const NOT_EXISTED_REGISTRY_CREATOR_VERSION = "HELLO_WORLD"
    const REGISTRY_CREATOR_1_ABI_LINK = "Q_IPFS_HASH_1"
    const REGISTRY_CREATOR_1_DESCRIPTION = "TEST_REGISTRY_VERSION_1"
    
    const REGISTRY_NAME_1 = "EXPENSIVE_REGISTRY_1"
    const REGISTRY_SYMBOL_1 = "EXP_1"

    before(async () => {
        
        creator = await RegistryCreator.new({ from: CHAINGEAR_OWNER })
        
        chaingear = await Chaingear.new(
            CHAINGEAR_BENEFICIARIES,
            CHAINGEAR_BENEFICIARIES_SHARES,
            CHAINGEAR_DESCRIPTION,
            BUILDING_FEE,
            CHAINGEAR_NAME,
            CHAINGEAR_SYMBOL,
            { 
                from: CHAINGEAR_OWNER,
                gas: CREATION_GAS
            }
        )

        await creator.setBuilder(
            chaingear.address, 
            {
                from: CHAINGEAR_OWNER 
            })
            
        await chaingear.addRegistryCreatorVersion(
            REGISTRY_CREATOR_1_VERSION,
            creator.address,
            REGISTRY_CREATOR_1_ABI_LINK,
            REGISTRY_CREATOR_1_DESCRIPTION,
            {
                from: CHAINGEAR_OWNER 
            })
            
    })

    it("#1/1 should allow anyone to build new registry with right fee and existed registry version", async () => {
        
        await chaingear.registerRegistry(
            REGISTRY_CREATOR_1_VERSION,
            [RANDOM_CREATOR_1],
            [100],
            REGISTRY_NAME_1,
            REGISTRY_SYMBOL_1,
            { 
                from: RANDOM_CREATOR_1,
                value: CREATION_FEE_EQUAL,
                gas: CREATION_GAS 
            }
        )
    
        const entriesAmount = await chaingear.registriesAmount()
    
        const createdAddress = await chaingear.contractAddressOf(entriesAmount-1)
        
        const registry = Registry.at(createdAddress)
        const name = await registry.name()
        name.should.equal(REGISTRY_NAME_1)
        
        const registryAdmin = await registry.registryAdmin()
        const registryOwner = await registry.owner()
        
        registryAdmin.should.equal(RANDOM_CREATOR_1)
        registryOwner.should.equal(chaingear.address)
        
    })
    
    it("#1/2 should not allow anyone to build new registry with wrong fee and existed registry version", async () => {
        
        await chaingear.registerRegistry(
            REGISTRY_CREATOR_1_VERSION,
            [RANDOM_CREATOR_1],
            [100],
            REGISTRY_NAME_1,
            REGISTRY_SYMBOL_1,
            { 
                from: RANDOM_CREATOR_1,
                value: CREATION_FEE_NOT_EQUAL,
                gas: CREATION_GAS 
            }
        ).should.be.rejected
    
    })
    
    it("#1/3 should not allow anyone to build new registry with right fee and not existed registry version", async () => {
        
        await chaingear.registerRegistry(
            NOT_EXISTED_REGISTRY_CREATOR_VERSION,
            [RANDOM_CREATOR_1],
            [100],
            REGISTRY_NAME_1,
            REGISTRY_SYMBOL_1,
            { 
                from: RANDOM_CREATOR_1,
                value: CREATION_FEE_EQUAL,
                gas: CREATION_GAS 
            }
        ).should.be.rejected
    
    })
    
    it("#2/1 should allow registry owner to set ABI link for registry", async () => {
    
        var ID = await chaingear.tokenOfOwnerByIndex(RANDOM_CREATOR_1, 0)
    
        await chaingear.setABILinkForRegistry(
            ID.toNumber(),
            "Q_HASH",
            {
                from: RANDOM_CREATOR_1
            }
        )
    
        const registryLink = await chaingear.ABILinkOf(ID.toNumber())
        registryLink.should.be.equal("Q_HASH")
    
    })
    
    it("#2/2 should not allow unknown to set ABI link for any registry", async () => {
    
        await chaingear.setABILinkForRegistry(
            0,
            "T_HASH",
            {
                from: UNKNOWN
            }
        ).should.be.rejected
    
    })
    
    // it("#3/1 should not allow registry owner to transfer tokenized ownership before registry initialized", async () => {
    // 
    //     true.should.be.equal(false)
    // 
    // })
    // 
    // it("#3/2 should allow registry owner to transfer tokenized ownership", async () => {
    // 
    //     true.should.be.equal(false)
    // 
    // })
    // 
    // it("#3/3 should not allow unknown to transfer tokenized ownership for any registry", async () => {
    // 
    //     true.should.be.equal(false)
    // 
    // })
    
    it("#4/1 should allow chaingear owner to add registry version to chaingear", async () => {
        
        await chaingear.addRegistryCreatorVersion(
            "V_TEST",
            "0x2",
            "Q_HASH",
            "THIS_IS_IT",
            {
                from: CHAINGEAR_OWNER 
            })
            
        const newRegistryCreationVersionHash = await chaingear.getRegistryCreatorInfo("V_TEST")
        newRegistryCreationVersionHash[1].should.be.equal("Q_HASH")
    
    })
    
    it("#4/2 should not allow unknown to add registry version to chaingear", async () => {
        
        await chaingear.addRegistryCreatorVersion(
            "V_TEST",
            "0x2",
            "Q_HASH",
            "THIS_IS_IT",
            {
                from: UNKNOWN 
            }).should.be.rejected
    
    })
    
    it("#5/1 should allow chaingear owner to change registration fee", async () => {
        
        await chaingear.updateRegistrationFee(
            7777777,
            {
                from: CHAINGEAR_OWNER 
            })
            
        const newRegistrationFee = await chaingear.registryRegistrationFee()
        newRegistrationFee.toNumber().should.be.equal(7777777)
    })
    
    it("#5/2 should not allow unknown to change registration fee", async () => {
        
        await chaingear.updateRegistrationFee(
            88888888,
            {
                from: UNKNOWN 
            }).should.be.rejected
    
    })
    
    it("#6/1 should allow chaingear owner to change description", async () => {
        
        await chaingear.updateDescription(
            "MOST AWESOME REGISTRY",
            {
                from: CHAINGEAR_OWNER 
            })
        
        const newChaingearDescription = await chaingear.chaingearDescription()
        newChaingearDescription.should.be.equal("MOST AWESOME REGISTRY")
    })
    
    it("#6/2 should not allow unknown to change description", async () => {
        
        await chaingear.updateDescription(
            "MOST USELESSNESS REGISTRY",
            {
                from: UNKNOWN 
            }).should.be.rejected
    
    })

})
