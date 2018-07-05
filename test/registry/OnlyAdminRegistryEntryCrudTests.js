const chai = require("chai")
chai.use(require("chai-as-promised"))
chai.should()

const RegistryUtils = require('./RegistryUtils')

contract("OnlyAdmin Registry Entry Crud Tests", (accounts) => {

    let registry
    const REGISTRY_OWNER_ACCOUNT = accounts[0]
    const REGISTRY_ADMIN_ACCOUNT = accounts[1]
    const UNKNOWN_ACCOUNT = accounts[2]

    before(async () => {
        registry = await RegistryUtils.createTestRegistry(REGISTRY_OWNER_ACCOUNT, REGISTRY_ADMIN_ACCOUNT)
    })

    /*  -------------------------------- Create Entry -----------------------  */
    //todo discuss: value can be only equal defined fee
    it("#1/1 should allow admin to add new entry with enough fee", async () => {
        const newEntryId = await registry.createEntry(REGISTRY_ADMIN_ACCOUNT, registry.fee)
        await registry.containsEntry(newEntryId).should.eventually.equal(true)

        await registry.createEntryPromise(REGISTRY_ADMIN_ACCOUNT, registry.fee + registry.fee).should.be.rejected
    })

    it("#1/2 should not allow registry owner to add new entry with enough fee", async () => {
        await registry.createEntryPromise(REGISTRY_OWNER_ACCOUNT, registry.fee).should.be.rejected
        await registry.createEntryPromise(REGISTRY_OWNER_ACCOUNT, registry.fee + registry.fee).should.be.rejected
    })

    it("#1/3 should not allow unknown to add new entry with enough fee", async () => {
        await registry.createEntryPromise(UNKNOWN_ACCOUNT, registry.fee).should.be.rejected
        await registry.createEntryPromise(UNKNOWN_ACCOUNT, registry.fee + registry.fee).should.be.rejected
    })

    //todo discuss: should admin be able to create entries without fee?
    it("#2/1 should not allow registry admin to add new entry without enough fee", async () => {
        await registry.createEntryPromise(REGISTRY_ADMIN_ACCOUNT, registry.fee - 1).should.be.rejected
    })

    it("#2/2 should not allow unknown to add new entry without enough fee", async () => {
        await registry.createEntryPromise(UNKNOWN_ACCOUNT, registry.fee - 1).should.be.rejected
    })

    /*  -------------------------------- Delete Entry -----------------------  */
    it("#3/1 should allow registry admin-as-user to delete his entry", async () => {
        const newEntryId = await registry.createEntry(REGISTRY_ADMIN_ACCOUNT)
        await registry.containsEntry(newEntryId).should.eventually.equal(true)

        await registry.deleteEntry(REGISTRY_ADMIN_ACCOUNT, newEntryId).should.be.fulfilled
        await registry.containsEntry(newEntryId).should.eventually.equal(false)
    })

    it("#3/2 should not allow registry owner to delete not his entry", async () => {
        const newEntryId = await registry.createEntry(REGISTRY_ADMIN_ACCOUNT)
        await registry.containsEntry(newEntryId).should.eventually.equal(true)

        await registry.deleteEntry(REGISTRY_OWNER_ACCOUNT, newEntryId).should.be.rejected
        await registry.containsEntry(newEntryId).should.eventually.equal(true)
    })

    it("#3/3 should not allow unknown to delete not his entry", async () => {
        const newEntryId = await registry.createEntry(REGISTRY_ADMIN_ACCOUNT)
        await registry.containsEntry(newEntryId).should.eventually.equal(true)

        await registry.deleteEntry(UNKNOWN_ACCOUNT, newEntryId).should.be.rejected
        await registry.containsEntry(newEntryId).should.eventually.equal(true)
    })
})
