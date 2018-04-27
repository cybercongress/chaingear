const BigNumber = require("bignumber.js")
const chai = require("chai")
chai.use(require("chai-bignumber")())
chai.use(require("chai-as-promised"))
chai.should()

const Registry = artifacts.require("Registry")
const EntryCore = artifacts.require("EntryCore")
const EntryCoreArtifacts = require("../build/contracts/EntryCore.json")

contract("Registry", (accounts) => {

    const PermissionTypeEntries = {
        OnlyAdmin: 0,
        Whitelist: 1,
        AllUsers: 2
    }

    const REGISTRY_OWNER = accounts[0]
    const ENTRY_OWNER = accounts[1]
    const UNKNOWN = accounts[2]
    
    const CREATION_FEE = 1000000
    const ZERO_CREATION_FEE = 0
    
    const CREATION_GAS = 8000000
    
    const REGISTRY_NAME = "EXPENSIVE_REGISTRY"
    const REGISTRY_SYMBOL = "EXP"
    const IPFS_HASH_1 = "HASH1"

    let registry

    before(async () => {
        registry = await Registry.new(
            [],
            [],
            REGISTRY_NAME,
            REGISTRY_SYMBOL,
            IPFS_HASH_1,
            EntryCoreArtifacts.bytecode,
            { 
                from: REGISTRY_OWNER,
                gas: CREATION_GAS 
            }
        )
    })


    it("#1 should allow owner to add empty new entry", async () => {
        
        const entryContractAddress = await registry.EntryBasic()
        const entries = EntryCore.at(entryContractAddress)
        const count1 = new BigNumber(await entries.entriesAmount())
        
        const res = await registry.createEntry(
            { 
                from: REGISTRY_OWNER, 
                value: ZERO_CREATION_FEE, 
                gas: CREATION_GAS 
            })
        
        const count2 = new BigNumber(await entries.entriesAmount())
        count2.should.bignumber.equal(count1.add(1))
        console.log("Gas used: " + res.receipt.gasUsed)

        // const entry = await registry.entries(count1)
        // web3.eth.getCode(entry[0]).should.equal(SampleEntryArtifacts.deployedBytecode)

        // const entryContract = SampleEntry.at(entry[0])
        // var attribute = await entryContract.str()
        // attribute.should.equal('a')
    })

    it("#2 should not allow unknown to create new empty entry", async () => {
        
        await registry.createEntry(
            { 
                from: UNKNOWN,
                value: ZERO_CREATION_FEE, 
                gas: CREATION_GAS 
            }).should.be.rejected
    })
    
    it("#3 should not allow to create new empty entry without creation fee", async () => {
        
        await registry.updateEntryCreationFee(
            CREATION_FEE, 
            { 
                from: REGISTRY_OWNER
            })
        
        await registry.createEntry(
            {
                from: REGISTRY_OWNER, 
                value: ZERO_CREATION_FEE, 
                gas: CREATION_GAS 
            }).should.be.rejected
    })
    
    it("#3 should not allow unknown to create new empty entry with creation fee", async () => {
        
        await registry.createEntry(
            {
                from: UNKNOWN, 
                value: CREATION_FEE, 
                gas: CREATION_GAS 
            }).should.be.rejected
    })

    it("#4 should allow entry owner to delete entry", async () => {
        const entryContractAddress = await registry.EntryBasic()
        const entries = EntryCore.at(entryContractAddress)
        const count1 = new BigNumber(await entries.entriesAmount())
        await registry.deleteEntry(
            count1.sub(1), 
            {
                from: REGISTRY_OWNER 
            })
    
        const count2 = new BigNumber(await entries.entriesAmount())
        count2.should.bignumber.equal(count1.sub(1))
    })
    
    it("#5 should not allow unknown to delete entry", async () => {
        const entryContractAddress = await registry.EntryBasic()
        const entries = EntryCore.at(entryContractAddress)
        const count1 = new BigNumber(await entries.entriesAmount())
        
        await registry.deleteEntry(
            count1.sub(1),
            { 
                from: UNKNOWN 
            }).should.be.rejected
    
    })
    
    it("#6 should allow registry owner to set entry creation fee", async () => {
        
        const newFee = 14
        await registry.updateEntryCreationFee(
            newFee,
            { 
                from: REGISTRY_OWNER
            })
    
        const fee = new BigNumber(await registry.entryCreationFee())
        
        fee.should.bignumber.equal(newFee)
    })
    
    
    it("#7 should not allow unknown to set entry creation fee", async () => {
        
        const newFee = randomFee()
        const oldFee = new BigNumber(await registry.entryCreationFee())
    
        await registry.updateEntryCreationFee(
            newFee,
            {
                from: UNKNOWN
            }).should.be.rejected
    
        const fee = new BigNumber(await registry.entryCreationFee())
        
        fee.should.bignumber.equal(oldFee)
    })
    
    it("#8 should allow registry owner to set permission type", async () => {
        
        await registry.updatePermissionTypeEntries(
            PermissionTypeEntries.OnlyAdmin,
            {
                from: REGISTRY_OWNER
            })
    
        const permissionsTypeEntries = new BigNumber(await registry.permissionsTypeEntries())
        
        permissionsTypeEntries.should.bignumber.equal(
            PermissionTypeEntries.OnlyAdmin
        )
    })
    
    it("#9 should not allow unknown to set permission type", async () => {
        
        await registry.updatePermissionTypeEntries(
            PermissionTypeEntries.AllUsers,
            {
                from: UNKNOWN
            }).should.be.rejected
    
        const permissionsTypeEntries = new BigNumber(await registry.permissionsTypeEntries())
        
        permissionsTypeEntries.should.bignumber.equal(
            PermissionTypeEntries.OnlyAdmin
        )
    })
    
    it("#10 should allow registry owner to set name", async () => {
        
        const newName = "new name"
        await registry.updateRegistryName(newName, { from: REGISTRY_OWNER })
    
        const name = await registry.registryName()
        
        name.should.be.equal(newName)
    })
    
    it("#11 should not allow registry owner to set too long name", async () => {
        
        const newName = "123456789012345678901234567890123"
        
        return registry.updateRegistryName(
            newName, 
            {
                from: REGISTRY_OWNER 
            }).should.be.rejected
    })
    
    it("#12 should not allow unknown to set name", async () => {
        
        const newName = "new name"
        
        return registry.updateRegistryName(
            newName,
            {
                from: UNKNOWN
            }).should.be.rejected
    })
    
    function randomFee(){
        return Math.floor(Math.random() * 100)
    }

})
