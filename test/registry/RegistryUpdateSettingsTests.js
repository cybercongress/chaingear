const chai = require("chai")
chai.should()
chai.use(require("chai-bignumber")())
chai.use(require("chai-as-promised"))

const {createTestRegistry, CreateEntryPermissionGroup} = require('./RegistryUtils')


contract("Registry Update Settings Tests", (accounts) => {

    let registry
    let registryDefaultDescription
    const REGISTRY_OWNER_ACCOUNT = accounts[0]
    const REGISTRY_ADMIN_ACCOUNT = accounts[1]
    const UNKNOWN_ACCOUNT = accounts[2]

    before(async () => {
        registry = await createTestRegistry(
            REGISTRY_OWNER_ACCOUNT, REGISTRY_ADMIN_ACCOUNT, 100000,
            CreateEntryPermissionGroup.AllUsers
        )
        registryDefaultDescription = registry.name
    })

    /*  -------------------------------- Entry Creation Fee -----------------  */
    it("#1/1 should allow registry admin to set entry creation fee", async () => {

        const newFee = registry.fee * 2
        await registry.updateEntryCreationFee(REGISTRY_ADMIN_ACCOUNT, newFee).should.be.fulfilled
        await registry.contract.getEntryCreationFee().should.eventually.bignumber.equal(newFee)
    })

    it("#1/2 should not allow registry owner to set entry creation fee", async () => {
    
        const newFee = registry.fee * 2
        await registry.updateEntryCreationFee(REGISTRY_OWNER_ACCOUNT, newFee).should.be.rejected
        await registry.contract.getEntryCreationFee().should.eventually.bignumber.equal(registry.fee)
    })
    
    it("#1/3 should not allow unknown account to set entry creation fee", async () => {
    
        const newFee = registry.fee * 2
        await registry.updateEntryCreationFee(UNKNOWN_ACCOUNT, newFee).should.be.rejected
        await registry.contract.getEntryCreationFee().should.eventually.bignumber.equal(registry.fee)
    })
    
    /*  -------------------------------- Registry Description ----------------------  */
    it("#2/1 should allow registry admin to set description", async () => {
    
        const newDescription = registryDefaultDescription + "1"
        await registry.updateRegistryDescription(REGISTRY_ADMIN_ACCOUNT, newDescription).should.be.fulfilled
        await registry.contract.getRegistryDescription().should.eventually.equal(newDescription)
    })
    
    it("#2/2 should not allow registry owner to set description", async () => {
    
        const currentDescription = await registry.contract.getRegistryDescription()
        const newDescription = registryDefaultDescription + "2"
        await registry.updateRegistryDescription(REGISTRY_OWNER_ACCOUNT, newDescription).should.be.rejected
        await registry.contract.getRegistryDescription().should.eventually.equal(currentDescription)
    })
    
    it("#2/3 should not allow unknown account to set description", async () => {
    
        const currentDescription = await registry.contract.getRegistryDescription()
        const newDescription = registryDefaultDescription + "3"
        await registry.updateRegistryDescription(UNKNOWN_ACCOUNT, newDescription).should.be.rejected
        await registry.contract.getRegistryDescription().should.eventually.equal(currentDescription)
    })
    
    it("#2/4 should not allow to set too long description", async () => {
    
        const currentDescription = await registry.contract.getRegistryDescription()
        const newDescription = registryDefaultDescription + "42".repeat(128)
        await registry.updateRegistryDescription(REGISTRY_ADMIN_ACCOUNT, newDescription).should.be.rejected
        await registry.contract.getRegistryDescription().should.eventually.equal(currentDescription)
    })
    
    /*  -------------------------------- Registry Name ----------------------  */
    it("#2/5 should allow registry admin to set new Registry name", async () => {
        const newName = "NEW_NAME"
        
        await registry.contract.updateName(
            newName, 
            {
                from: REGISTRY_ADMIN_ACCOUNT
            }
        ).should.be.fulfilled
        
        await registry.contract.name().should.eventually.equal(newName)
    })
})
