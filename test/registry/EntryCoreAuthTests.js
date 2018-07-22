// TODO

// 1 not allow any user directly create entry
// 1 not allow any user directly delete entry

const chai = require("chai")
chai.use(require("chai-as-promised"))
chai.should()

const RegistryUtils = require('./RegistryUtils')
const EntryCore = artifacts.require("EntryCore")

contract("Only Registry can CruD with EntryCore", (accounts) => {

    let registry
    const REGISTRY_OWNER_ACCOUNT = accounts[0]
    const REGISTRY_ADMIN_ACCOUNT = accounts[1]
    const UNKNOWN_ACCOUNT = accounts[2]

    before(async () => {
        registry = await RegistryUtils.createTestRegistry(REGISTRY_OWNER_ACCOUNT, REGISTRY_ADMIN_ACCOUNT)
    })

    it("#1/1 should not allow unknown to add new entry", async () => {
        const entriesStorageAddress = await registry.getEntriesStorage()
        const entryCore = EntryCore.at(entriesStorageAddress)
        await entryCore.createEntry({from: UNKNOWN_ACCOUNT}).should.be.rejected
    })
    
    it("#1/2 should not allow unknown to delete entry", async () => {
        const newEntryId = await registry.createEntry(REGISTRY_ADMIN_ACCOUNT, registry.fee)
        
        const entriesStorageAddress = await registry.getEntriesStorage()
        const entryCore = EntryCore.at(entriesStorageAddress)
        await entryCore.deleteEntry(newEntryId, {from: UNKNOWN_ACCOUNT}).should.be.rejected
    })

    after(async() =>{
        registry = null
    })
    
})
