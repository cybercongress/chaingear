const chai = require("chai")
chai.use(require("chai-as-promised"))
chai.should()

const RegistryUtils = require('./RegistryUtils')
const EntryCore = artifacts.require("TeamSchema")

contract("All Users Registry Entry Crud Tests", (accounts) => {

    let registry
    const REGISTRY_OWNER_ACCOUNT = accounts[0]
    const REGISTRY_ADMIN_ACCOUNT = accounts[1]
    const UNKNOWN_ACCOUNT = accounts[2]
    const VERY_UNKNOWN_ACCOUNT = accounts[5]

    before(async () => {
        registry = await RegistryUtils.createTestRegistry(
            REGISTRY_OWNER_ACCOUNT, REGISTRY_ADMIN_ACCOUNT, 100000,
            RegistryUtils.CreateEntryPermissionGroup.AllUsers
        )
    })

    /*  -------------------------------- Create Entry -----------------------  */
    //todo discuss: value can be only equal defined fee
    it("#1/1 should allow registry admin to add new entry with enough fee", async () => {
        const newEntryId = await registry.createEntry(REGISTRY_ADMIN_ACCOUNT, registry.fee)
        await registry.containsEntry(newEntryId).should.eventually.equal(true)
    
        await registry.createEntryPromise(REGISTRY_ADMIN_ACCOUNT, registry.fee + registry.fee).should.be.rejected
    })
    
    it("#1/2 should allow registry owner to add new entry with enough fee", async () => {
        const newEntryId = await registry.createEntry(REGISTRY_OWNER_ACCOUNT, registry.fee)
        await registry.containsEntry(newEntryId).should.eventually.equal(true)
    
        await registry.createEntryPromise(UNKNOWN_ACCOUNT, registry.fee + registry.fee).should.be.rejected
    })
    
    it("#1/3 should allow unknown to add new entry with enough fee", async () => {
        const newEntryId = await registry.createEntry(UNKNOWN_ACCOUNT, registry.fee)
        await registry.containsEntry(newEntryId).should.eventually.equal(true)
    
        await registry.createEntryPromise(UNKNOWN_ACCOUNT, registry.fee + registry.fee).should.be.rejected
    })
    
    it("#1/4 should allow unknown to add new entry and update them", async () => {
        const newEntryId = await registry.createEntry(UNKNOWN_ACCOUNT, registry.fee)
        await registry.containsEntry(newEntryId).should.eventually.equal(true)
    
        const entriesStorageAddress = await registry.getEntriesStorage()
        const entryCore = EntryCore.at(entriesStorageAddress)
    
        await entryCore.updateEntry(
            newEntryId,
            "VALERY LITVIN",
            "0xf103D2db8024F4B885433ADAF72032Ac58304e03",
            "0x00cFF8CF7Bff03A9A2a81c01920ffD8cFa7AE9D0",
            "litvintech",
            "litvintech",
            "litvintech",
            {
                from: UNKNOWN_ACCOUNT
            }
        ).should.be.fulfilled
    
        const entryInfo = await entryCore.readEntry(newEntryId.toNumber())
        const name = entryInfo.toString().split(',')[0]
        name.should.be.equal("VALERY LITVIN")
    })
    
    it("#1/5 should not allow very unknown to update not his entry", async () => {
        const newEntryId = await registry.createEntry(UNKNOWN_ACCOUNT, registry.fee)
        await registry.containsEntry(newEntryId).should.eventually.equal(true)
    
        const entriesStorageAddress = await registry.getEntriesStorage()
        const entryCore = EntryCore.at(entriesStorageAddress)
    
        await entryCore.updateEntry(
            newEntryId,
            UNKNOWN_ACCOUNT,
            42,
            -42,
            "42",
            {
                from: VERY_UNKNOWN_ACCOUNT
            }
        ).should.be.rejected
    })
    
    it("#1/6 should not allow unknown add entry with non-uniq string (example in EntryCore)", async () => {
        const newEntryId = await registry.createEntry(UNKNOWN_ACCOUNT, registry.fee)
        await registry.containsEntry(newEntryId).should.eventually.equal(true)
    
        const entriesStorageAddress = await registry.getEntriesStorage()
        const entryCore = EntryCore.at(entriesStorageAddress)
    
        await entryCore.updateEntry(
            newEntryId,
            UNKNOWN_ACCOUNT,
            1,
            -1,
            "42",
            {
                from: UNKNOWN_ACCOUNT
            }
        ).should.be.rejected
    })
    
    //todo discuss: should admin be able to create entries without fee?
    it("#2/1 should not allow admin to add new entry without enough fee", async () => {
        await registry.createEntryPromise(REGISTRY_ADMIN_ACCOUNT, registry.fee - 1).should.be.rejected
    })
    
    it("#2/2 should not allow unknown to add new entry without enough fee", async () => {
        await registry.createEntryPromise(UNKNOWN_ACCOUNT, registry.fee - 1).should.be.rejected
    })
    
    /*  -------------------------------- Delete Entry -----------------------  */
    it("#3/1 should allow registry admin to delete his entry", async () => {
        const newEntryId = await registry.createEntry(REGISTRY_ADMIN_ACCOUNT)
        await registry.containsEntry(newEntryId).should.eventually.equal(true)
    
        await registry.deleteEntry(REGISTRY_ADMIN_ACCOUNT, newEntryId).should.be.fulfilled
        await registry.containsEntry(newEntryId).should.eventually.equal(false)
    })
    
    it("#3/1 should allow registry admin to delete his entry", async () => {
        const newEntryId = await registry.createEntry(REGISTRY_ADMIN_ACCOUNT)
        await registry.containsEntry(newEntryId).should.eventually.equal(true)
    
        await registry.deleteEntry(REGISTRY_ADMIN_ACCOUNT, newEntryId).should.be.fulfilled
        await registry.containsEntry(newEntryId).should.eventually.equal(false)
    })
    
    it("#3/2 should allow registry owner to delete entry if her is entry owner", async () => {
        const newEntryId = await registry.createEntry(REGISTRY_OWNER_ACCOUNT)
        await registry.containsEntry(newEntryId).should.eventually.equal(true)
    
        await registry.deleteEntry(REGISTRY_OWNER_ACCOUNT, newEntryId).should.be.fulfilled
        await registry.containsEntry(newEntryId).should.eventually.equal(false)
    })
    
    it("#3/3 should not allow registry admin to delete entry if it's not his entry", async () => {
        const newEntryId = await registry.createEntry(UNKNOWN_ACCOUNT)
        await registry.containsEntry(newEntryId).should.eventually.equal(true)
    
        await registry.deleteEntry(REGISTRY_ADMIN_ACCOUNT, newEntryId).should.be.rejected
        await registry.containsEntry(newEntryId).should.eventually.equal(true)
    })
    
    it("#3/4 should not allow registry owner to delete entry if it's not his entry", async () => {
        const newEntryId = await registry.createEntry(UNKNOWN_ACCOUNT)
        await registry.containsEntry(newEntryId).should.eventually.equal(true)
    
        await registry.deleteEntry(REGISTRY_OWNER_ACCOUNT, newEntryId).should.be.rejected
        await registry.containsEntry(newEntryId).should.eventually.equal(true)
    })
    
    it("#3/5 should allow unknown to delete entry his entry", async () => {
        const newEntryId = await registry.createEntry(UNKNOWN_ACCOUNT)
        await registry.containsEntry(newEntryId).should.eventually.equal(true)
    
        await registry.deleteEntry(UNKNOWN_ACCOUNT, newEntryId).should.be.fulfilled
        await registry.containsEntry(newEntryId).should.eventually.equal(false)
    })
    
    it("#3/6 should not allow unknown to delete entry if it's not his entry", async () => {
        const newEntryId = await registry.createEntry(REGISTRY_ADMIN_ACCOUNT)
        await registry.containsEntry(newEntryId).should.eventually.equal(true)
    
        await registry.deleteEntry(UNKNOWN_ACCOUNT, newEntryId).should.be.rejected
        await registry.containsEntry(newEntryId).should.eventually.equal(true)
    })
    
    it("#3/7 should not allow unknown to delete entry his entry if there is funds", async () => {
        const newEntryId = await registry.createEntry(UNKNOWN_ACCOUNT)
        await registry.containsEntry(newEntryId).should.eventually.equal(true)
    
        const entrySafeBalanceBefore = await registry.contract.getSafeBalance()
    
        const entryFunding = 100000
    
        await registry.contract.fundEntry( 
                newEntryId,
                {
                    from: UNKNOWN_ACCOUNT,
                    value: entryFunding
                }
        )
    
        const entrySafeBalanceAfter = await registry.contract.getSafeBalance()
        const diff = entrySafeBalanceAfter.toNumber() - entrySafeBalanceBefore.toNumber()
        diff.should.be.equal(100000)
    
        await registry.deleteEntry(UNKNOWN_ACCOUNT, newEntryId).should.be.rejected
        await registry.containsEntry(newEntryId).should.eventually.equal(true)
    })
    
    it("#3/8 should allow unknown to delete entry his entry if there is no funds", async () => {
        const newEntryId = await registry.createEntry(UNKNOWN_ACCOUNT)
        await registry.containsEntry(newEntryId).should.eventually.equal(true)
    
        const entrySafeBalanceBefore = await registry.contract.getSafeBalance()
    
        const entryFunding = 100000
    
        await registry.contract.fundEntry( 
                newEntryId,
                {
                    from: UNKNOWN_ACCOUNT,
                    value: entryFunding
                }
        )
    
        const entrySafeBalanceAfter = await registry.contract.getSafeBalance()
        const diff = entrySafeBalanceAfter.toNumber() - entrySafeBalanceBefore.toNumber()
        diff.should.be.equal(entryFunding)
    
        await registry.deleteEntry(UNKNOWN_ACCOUNT, newEntryId).should.be.rejected
        await registry.containsEntry(newEntryId).should.eventually.equal(true)
    
        await registry.contract.claimEntryFunds(
            newEntryId,
            entryFunding,
            {
                from: UNKNOWN_ACCOUNT
            }
        )
    
        await registry.deleteEntry(UNKNOWN_ACCOUNT, newEntryId).should.be.fulfilled
        await registry.containsEntry(newEntryId).should.eventually.equal(false)
    })
    

    after(async() =>{
        registry = null
    })
})
