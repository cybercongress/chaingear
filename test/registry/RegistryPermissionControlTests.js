const chai = require("chai")
chai.should()
chai.use(require("chai-bignumber")())
chai.use(require("chai-as-promised"))

const RegistryCreateEntryPermissionGroup = require('./RegistryUtils').CreateEntryPermissionGroup
const RegistryPermissionControlTestContract = artifacts.require('RegistryPermissionControlTestContract');

contract("RegistryPermissionControlTestContract", (accounts) => {

    let contract;
    const OWNER_ACCOUNT = accounts[0]
    const ADMIN_ACCOUNT = accounts[1]
    const UNKNOWN_ACCOUNT = accounts[2]

    before(async () => {
        contract = await RegistryPermissionControlTestContract.new({from: OWNER_ACCOUNT})
        contract.changeAdmin(ADMIN_ACCOUNT, {from: OWNER_ACCOUNT})
    });

    it("#1/1 should allow registry admin to set entry creation permission group", async () => {
        const currentPermissionGroup = await contract.getRegistryPermissions()
        const newPermissionGroup = anotherCreateEntryPermissionGroup(currentPermissionGroup)
        await contract.updateCreateEntryPermissionGroup(newPermissionGroup, {from: ADMIN_ACCOUNT}).should.be.fulfilled
        await contract.getRegistryPermissions().should.eventually.bignumber.equal(newPermissionGroup)
    })

    it("#1/2 should not allow registry owner to set entry creation permission group", async () => {
        const currentPermissionGroup = await contract.getRegistryPermissions()
        const newPermissionGroup = anotherCreateEntryPermissionGroup(currentPermissionGroup)
        await contract.updateCreateEntryPermissionGroup(newPermissionGroup, {from: OWNER_ACCOUNT}).should.be.rejected
        await contract.getRegistryPermissions().should.eventually.bignumber.equal(currentPermissionGroup)
    })
    
    it("#1/3 should not allow unknown account to set entry creation permission group", async () => {
        const currentPermissionGroup = await contract.getRegistryPermissions()
        const newPermissionGroup = anotherCreateEntryPermissionGroup(currentPermissionGroup)
        await contract.updateCreateEntryPermissionGroup(newPermissionGroup, {from: UNKNOWN_ACCOUNT}).should.be.rejected
        await contract.getRegistryPermissions().should.eventually.bignumber.equal(currentPermissionGroup)
    })
    
    it("#2/1 should allow only admin to invoke methods with modifier 'onlyPermissionedToCreateEntries'", async () => {
    
        await contract.updateCreateEntryPermissionGroup(
            RegistryCreateEntryPermissionGroup.OnlyAdmin, {from: ADMIN_ACCOUNT}
        ).should.be.fulfilled
        const value = await contract.uintValue_()
    
        await contract.testOnlyPermissionedToCreateEntries(value + 1, {from: ADMIN_ACCOUNT}).should.be.fulfilled
        await contract.uintValue_().should.eventually.bignumber.equal(value + 1)
        await contract.testOnlyPermissionedToCreateEntries(value + 2, {from: UNKNOWN_ACCOUNT}).should.be.rejected
        await contract.uintValue_().should.eventually.bignumber.not.equal(value + 2)
        await contract.testOnlyPermissionedToCreateEntries(value + 3, {from: OWNER_ACCOUNT}).should.be.rejected
        await contract.uintValue_().should.eventually.bignumber.not.equal(value + 3)
    })
    
    it("#2/2 should allow all to invoke methods with modifier 'onlyPermissionedToCreateEntries'", async () => {
    
        await contract.updateCreateEntryPermissionGroup(
            RegistryCreateEntryPermissionGroup.AllUsers, {from: ADMIN_ACCOUNT}
        ).should.be.fulfilled
        const value = await contract.uintValue_()
    
        await contract.testOnlyPermissionedToCreateEntries(value + 1, {from: ADMIN_ACCOUNT}).should.be.fulfilled
        await contract.uintValue_().should.eventually.bignumber.equal(value + 1)
        await contract.testOnlyPermissionedToCreateEntries(value + 2, {from: UNKNOWN_ACCOUNT}).should.be.fulfilled
        await contract.uintValue_().should.eventually.bignumber.equal(value + 2)
        await contract.testOnlyPermissionedToCreateEntries(value + 3, {from: OWNER_ACCOUNT}).should.be.fulfilled
        await contract.uintValue_().should.eventually.bignumber.equal(value + 3)
    })
})

function anotherCreateEntryPermissionGroup(registryCreateEntryPermissionGroup) {
    if (registryCreateEntryPermissionGroup === RegistryCreateEntryPermissionGroup.OnlyAdmin) {
        return RegistryCreateEntryPermissionGroup.AllUsers
    } else {
        return RegistryCreateEntryPermissionGroup.OnlyAdmin
    }
}
