const chai = require("chai")
chai.use(require("chai-as-promised"))
chai.should()

const EntryCore = artifacts.require("TeamSchema")
const Registry = artifacts.require("Registry")

contract("Schema: TeamSchema", (accounts) => {
    
    const CreateEntryPermissionGroup = {
        OnlyAdmin: 0,
        Whitelist: 1,
        AllUsers: 2
    }

    let registry
    const REGISTRY_OWNER_ACCOUNT = accounts[0]
    const REGISTRY_ADMIN_ACCOUNT = accounts[1]
    const UNKNOWN_ACCOUNT = accounts[2]

    before(async () => {
        registry = await Registry.new(
            [REGISTRY_ADMIN_ACCOUNT], [100], "TEST", "TST",
            {from: REGISTRY_OWNER_ACCOUNT, gas: 10000000}
        )
        await registry.transferAdminRights(REGISTRY_ADMIN_ACCOUNT, {from: REGISTRY_OWNER_ACCOUNT})
        
        await registry.updateCreateEntryPermissionGroup(CreateEntryPermissionGroup.OnlyAdmin, {from: REGISTRY_ADMIN_ACCOUNT})
        await registry.updateEntryCreationFee(10000, {from: REGISTRY_ADMIN_ACCOUNT})
        await registry.initializeRegistry("IPFS_CID", EntryCore.bytecode, {from: REGISTRY_ADMIN_ACCOUNT})
    })
    
    it("#1/1 should not allow unknown to add new entry", async () => {
        const entriesStorageAddress = await registry.getEntriesStorage()
        const entryCore = await EntryCore.at(entriesStorageAddress)
        await entryCore.createEntry({from: UNKNOWN_ACCOUNT}).should.be.rejected
    })
    
    it("#1/2 should not allow unknown to delete entry", async () => {
        const newEntryId = await registry.createEntry({from:REGISTRY_ADMIN_ACCOUNT, value:10000})
    
        const entriesStorageAddress = await registry.getEntriesStorage()
        const entryCore = await EntryCore.at(entriesStorageAddress)
        await entryCore.deleteEntry(newEntryId, {from: UNKNOWN_ACCOUNT}).should.be.rejected
    })

    after(async() =>{
        registry = null
    })
    
})
