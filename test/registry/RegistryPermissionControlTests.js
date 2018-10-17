const chai = require("chai")
chai.should()
// chai.use(require("chai-bignumber")())
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
        contract.transferAdminRights(ADMIN_ACCOUNT, {from: OWNER_ACCOUNT})
    });

    it("#1/1 should allow registry admin to set entry creation permission group", async () => {
        const currentPermissionGroup = await contract.getRegistryPermissions()
        const newPermissionGroup = anotherCreateEntryPermissionGroup(currentPermissionGroup)
        await contract.updateCreateEntryPermissionGroup(newPermissionGroup, {from: ADMIN_ACCOUNT}).should.be.fulfilled
        const updatedPermissionGroup = await contract.getRegistryPermissions()
        updatedPermissionGroup.toNumber().should.equal(newPermissionGroup);
    })

    it("#1/2 should not allow registry owner to set entry creation permission group", async () => {
        const currentPermissionGroup = await contract.getRegistryPermissions()
        const newPermissionGroup = anotherCreateEntryPermissionGroup(currentPermissionGroup)
        await contract.updateCreateEntryPermissionGroup(newPermissionGroup, {from: OWNER_ACCOUNT}).should.be.rejected
        const updatedPermissionGroup = await contract.getRegistryPermissions()
        updatedPermissionGroup.toNumber().should.equal(currentPermissionGroup.toNumber());
    })
    
    it("#1/3 should not allow unknown account to set entry creation permission group", async () => {
        const currentPermissionGroup = await contract.getRegistryPermissions()
        const newPermissionGroup = anotherCreateEntryPermissionGroup(currentPermissionGroup)
        await contract.updateCreateEntryPermissionGroup(newPermissionGroup, {from: UNKNOWN_ACCOUNT}).should.be.rejected
        const updatedPermissionGroup = await contract.getRegistryPermissions()
        updatedPermissionGroup.toNumber().should.equal(currentPermissionGroup.toNumber());
    })
    
    it("#2/1 should allow only admin to invoke methods with modifier 'onlyPermissionedToCreateEntries'", async () => {
    
        await contract.updateCreateEntryPermissionGroup(
            RegistryCreateEntryPermissionGroup.OnlyAdmin, {from: ADMIN_ACCOUNT}
        ).should.be.fulfilled
        const value = await contract.uintValue_()
        const number = value.toNumber()
    
        await contract.testOnlyPermissionedToCreateEntries(number + 1, {from: ADMIN_ACCOUNT}).should.be.fulfilled
        const result1 = await contract.uintValue_()
        result1.toNumber().should.equal(number + 1)
    
        await contract.testOnlyPermissionedToCreateEntries(number + 2, {from: UNKNOWN_ACCOUNT}).should.be.rejected
        const result2 = await contract.uintValue_()
        result2.toNumber().should.not.equal(number + 2)
    
        await contract.testOnlyPermissionedToCreateEntries(number + 3, {from: OWNER_ACCOUNT}).should.be.rejected
        const result3 = await contract.uintValue_()
        result3.toNumber().should.not.equal(number + 3)
    })
    
    it("#2/2 should allow all to invoke methods with modifier 'onlyPermissionedToCreateEntries'", async () => {
    
        await contract.updateCreateEntryPermissionGroup(
            RegistryCreateEntryPermissionGroup.AllUsers, {from: ADMIN_ACCOUNT}
        ).should.be.fulfilled
        const value = await contract.uintValue_()
        const number = value.toNumber()
    
        await contract.testOnlyPermissionedToCreateEntries(number + 1, {from: ADMIN_ACCOUNT}).should.be.fulfilled
        const result1 = await contract.uintValue_()
        result1.toNumber().should.equal(number + 1)
    
        await contract.testOnlyPermissionedToCreateEntries(number + 2, {from: UNKNOWN_ACCOUNT}).should.be.fulfilled
        const result2 = await contract.uintValue_()
        result2.toNumber().should.equal(number + 2)
    
        await contract.testOnlyPermissionedToCreateEntries(number + 3, {from: OWNER_ACCOUNT}).should.be.fulfilled
        const result3 = await contract.uintValue_()
        result3.toNumber().should.equal(number + 3)
    })

    after(async() =>{
        contract = null;
    })
})

function anotherCreateEntryPermissionGroup(registryCreateEntryPermissionGroup) {
    if (registryCreateEntryPermissionGroup === RegistryCreateEntryPermissionGroup.OnlyAdmin) {
        return RegistryCreateEntryPermissionGroup.AllUsers
    } else {
        return RegistryCreateEntryPermissionGroup.OnlyAdmin
    }
}
