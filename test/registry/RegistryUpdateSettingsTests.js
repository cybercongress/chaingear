const chai = require("chai")
chai.should()
chai.use(require("chai-bignumber")())
chai.use(require("chai-as-promised"))

const {createTestRegistry, CreateEntryPermissionGroup} = require('./RegistryUtils')


contract("Registry Update Settings Tests", (accounts) => {

    let registry
    let registryDefaultName
    const REGISTRY_OWNER_ACCOUNT = accounts[0]
    const REGISTRY_ADMIN_ACCOUNT = accounts[1]
    const UNKNOWN_ACCOUNT = accounts[2]

    before(async () => {
        registry = await createTestRegistry(
            REGISTRY_OWNER_ACCOUNT, REGISTRY_ADMIN_ACCOUNT, 100000,
            CreateEntryPermissionGroup.AllUsers
        )
        registryDefaultName = registry.name
    })

    /*  -------------------------------- Entry Creation Fee -----------------  */
    it("#1/1 should allow registry admin to set entry creation fee", async () => {

        const newFee = registry.fee * 2
        await registry.updateEntryCreationFee(REGISTRY_ADMIN_ACCOUNT, newFee).should.be.fulfilled
        await registry.contract.entryCreationFee().should.eventually.bignumber.equal(newFee)
    })

    it("#1/2 should not allow registry owner to set entry creation fee", async () => {

        const newFee = registry.fee * 2
        await registry.updateEntryCreationFee(REGISTRY_OWNER_ACCOUNT, newFee).should.be.rejected
        await registry.contract.entryCreationFee().should.eventually.bignumber.equal(registry.fee)
    })

    it("#1/3 should not allow unknown account to set entry creation fee", async () => {

        const newFee = registry.fee * 2
        await registry.updateEntryCreationFee(UNKNOWN_ACCOUNT, newFee).should.be.rejected
        await registry.contract.entryCreationFee().should.eventually.bignumber.equal(registry.fee)
    })

    /*  -------------------------------- Registry Name ----------------------  */
    it("#2/1 should allow registry admin to set name", async () => {

        const newName = registryDefaultName + "1"
        await registry.updateRegistryName(REGISTRY_ADMIN_ACCOUNT, newName).should.be.fulfilled
        await registry.contract.registryName().should.eventually.equal(newName)
    })

    it("#2/2 should not allow registry owner to set name", async () => {

        const currentName = await registry.contract.registryName()
        const newName = registryDefaultName + "2"
        await registry.updateRegistryName(REGISTRY_OWNER_ACCOUNT, newName).should.be.rejected
        await registry.contract.registryName().should.eventually.equal(currentName)
    })

    it("#2/3 should not allow unknown account to set name", async () => {

        const currentName = await registry.contract.registryName()
        const newName = registryDefaultName + "3"
        await registry.updateRegistryName(UNKNOWN_ACCOUNT, newName).should.be.rejected
        await registry.contract.registryName().should.eventually.equal(currentName)
    })

    it("#2/4 should not allow to set too long name", async () => {

        const currentName = await registry.contract.registryName()
        const newName = registryDefaultName + "VeryVeryVeryLongSuffixWithTonsOfBytes"
        await registry.updateRegistryName(REGISTRY_ADMIN_ACCOUNT, newName).should.be.rejected
        await registry.contract.registryName().should.eventually.equal(currentName)
    })
})


