const chai = require("chai")
chai.should()
chai.use(require("chai-bignumber")())
chai.use(require("chai-as-promised"))

const {createTestRegistry, RegistryCreateEntryPermissionGroup} = require('./RegistryUtils')


contract("Registry Update Settings Tests", (accounts) => {

    let registry
    let registryDefaultName
    const REGISTRY_OWNER_ACCOUNT = accounts[0]
    const REGISTRY_ADMIN_ACCOUNT = accounts[1]
    const UNKNOWN_ACCOUNT = accounts[2]

    before(async () => {
        registry = await createTestRegistry(
            REGISTRY_OWNER_ACCOUNT, REGISTRY_ADMIN_ACCOUNT, 100000,
            RegistryCreateEntryPermissionGroup.AllUsers
        )
        registryDefaultName = registry.name
    })

    /*  -------------------------------- Entry Creation Fee -----------------  */
    it("#1 should allow registry admin to set entry creation fee", async () => {

        const newFee = registry.fee * 2
        await registry.updateEntryCreationFee(REGISTRY_ADMIN_ACCOUNT, newFee).should.be.fulfilled
        await registry.contract.entryCreationFee().should.eventually.bignumber.equal(newFee)
    })

    it("#2 should not allow registry owner to set entry creation fee", async () => {

        const newFee = registry.fee * 2
        await registry.updateEntryCreationFee(REGISTRY_OWNER_ACCOUNT, newFee).should.be.rejected
        await registry.contract.entryCreationFee().should.eventually.bignumber.equal(registry.fee)
    })

    it("#3 should not allow unknown account to set entry creation fee", async () => {

        const newFee = registry.fee * 2
        await registry.updateEntryCreationFee(UNKNOWN_ACCOUNT, newFee).should.be.rejected
        await registry.contract.entryCreationFee().should.eventually.bignumber.equal(registry.fee)
    })

    /*  -------------------------------- Create Entry Permission Group ------  */
    it("#4 should allow registry admin to set entry creation permission group", async () => {

        const currentPermissionGroup = await registry.registryCreateEntryPermissionGroup()
        const newPermissionGroup = anotherRegistryCreateEntryPermissionGroup(currentPermissionGroup)

        await registry.contract.updatePermissionTypeEntries(
            newPermissionGroup, {from: REGISTRY_ADMIN_ACCOUNT}
        ).should.be.fulfilled

        await registry.registryCreateEntryPermissionGroup().should.eventually.be.equal(newPermissionGroup)
    })

    it("#5 should not allow registry owner to set entry creation permission group", async () => {

        const currentPermissionGroup = await registry.registryCreateEntryPermissionGroup()
        const newPermissionGroup = anotherRegistryCreateEntryPermissionGroup(currentPermissionGroup)

        await registry.contract.updatePermissionTypeEntries(
            newPermissionGroup, {from: REGISTRY_OWNER_ACCOUNT}
        ).should.be.rejected

        await registry.registryCreateEntryPermissionGroup().should.eventually.be.equal(currentPermissionGroup)
    })

    it("#6 should not allow unknown account to set entry creation permission group", async () => {

        const currentPermissionGroup = await registry.registryCreateEntryPermissionGroup()
        const newPermissionGroup = anotherRegistryCreateEntryPermissionGroup(currentPermissionGroup)

        await registry.contract.updatePermissionTypeEntries(
            newPermissionGroup, {from: UNKNOWN_ACCOUNT}
        ).should.be.rejected

        await registry.registryCreateEntryPermissionGroup().should.eventually.be.equal(currentPermissionGroup)
    })

    /*  -------------------------------- Registry Name ----------------------  */
    it("#7 should allow registry admin to set name", async () => {

        const newName = registryDefaultName + "1"
        await registry.updateRegistryName(REGISTRY_ADMIN_ACCOUNT, newName).should.be.fulfilled
        await registry.contract.registryName().should.eventually.equal(newName)
    })

    it("#8 should not allow registry owner to set name", async () => {

        const currentName = await registry.contract.registryName()
        const newName = registryDefaultName + "2"
        await registry.updateRegistryName(REGISTRY_OWNER_ACCOUNT, newName).should.be.rejected
        await registry.contract.registryName().should.eventually.equal(currentName)
    })

    it("#9 should not allow unknown account to set name", async () => {

        const currentName = await registry.contract.registryName()
        const newName = registryDefaultName + "3"
        await registry.updateRegistryName(UNKNOWN_ACCOUNT, newName).should.be.rejected
        await registry.contract.registryName().should.eventually.equal(currentName)
    })

    it("#10 should not allow to set too long name", async () => {

        const currentName = await registry.contract.registryName()
        const newName = registryDefaultName + "VeryVeryVeryLongSuffixWithTonsOfBytes"
        await registry.updateRegistryName(REGISTRY_ADMIN_ACCOUNT, newName).should.be.rejected
        await registry.contract.registryName().should.eventually.equal(currentName)
    })
})

function anotherRegistryCreateEntryPermissionGroup(registryCreateEntryPermissionGroup) {
    if (registryCreateEntryPermissionGroup === RegistryCreateEntryPermissionGroup.OnlyAdmin) {
        return RegistryCreateEntryPermissionGroup.AllUsers
    } else {
        return RegistryCreateEntryPermissionGroup.OnlyAdmin
    }
}
