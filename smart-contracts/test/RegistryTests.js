const BigNumber = require("bignumber.js")
const chai = require("chai")
chai.use(require("chai-bignumber")())
chai.use(require("chai-as-promised"))
chai.should()

const Registry = artifacts.require("Registry.sol")
const SampleEntry = require("../build/contracts/SampleEntry.json")

contract("Registry", (accounts) => {

    const PermissionType = {
        OnlyOwner: 0,
        All: 1
    }

    const REGISTRY_OWNER = accounts[0]
    const ENTRY_OWNER = accounts[1]
    const UNKNOWN = accounts[2]
    const CREATION_FEE = 1
    const CREATION_GAS = 4000000

    let registry

    before(async () => {
        registry = await Registry.new(
            PermissionType.All,
            CREATION_FEE,
            { from: REGISTRY_OWNER }
        )
    })


    it("#1 should allow to add and deploy new entry", async () => {
        const count1 = new BigNumber(await registry.entriesCount())
        await registry.createEntry(SampleEntry.bytecode, { from: ENTRY_OWNER, value: CREATION_FEE, gas: CREATION_GAS })
        const count2 = new BigNumber(await registry.entriesCount())

        count2.should.bignumber.equal(count1.add(1))

        const entry = await registry.entries(count1)
        web3.eth.getCode(entry[0]).should.equal(SampleEntry.deployedBytecode)
    })

    it("#2 should not allow to create new entry without creation fee", async () => {
        await registry.createEntry(SampleEntry.bytecode, { from: ENTRY_OWNER, value: 0, gas: CREATION_GAS }).should.be.rejected
    })

    it("#3 should not allow unknown to create entry if permission type = OnlyOwner", async () => {
        const registry2 = await Registry.new(
            PermissionType.OnlyOwner,
            CREATION_FEE,
            { from: REGISTRY_OWNER }
        )

        const count1 = new BigNumber(await registry2.entriesCount())
        await registry2.createEntry(SampleEntry.bytecode, { from: ENTRY_OWNER, value: CREATION_FEE, gas: CREATION_GAS }).should.be.rejected
        const count2 = new BigNumber(await registry2.entriesCount())

        count2.should.bignumber.equal(count1)
    })

    it("#4 should allow entry owner to delete entry", async () => {
        const count1 = new BigNumber(await registry.entriesCount())
        await registry.deleteEntry(count1.sub(1), { from: ENTRY_OWNER })

        const entry = await registry.entries(count1.sub(1))

        entry[0].should.equal('0x0000000000000000000000000000000000000000')
    })

    it("#5 should not allow unknown to delete entry", async () => {
        const count1 = new BigNumber(await registry.entriesCount())
        await registry.deleteEntry(count1, { from: UNKNOWN }).should.be.rejected

        const entry = await registry.entries(count1.sub(1))

        entry[0].should.equal('0x0000000000000000000000000000000000000000')
    })

    it("#6 should allow registry owner to set entry creation fee", async () => {
        const newFee = 14
        await registry.setEntryCreationFee(newFee, { from: REGISTRY_OWNER })

        const fee = new BigNumber(await registry.entryCreationFee())
        fee.should.bignumber.equal(newFee)
    })


    it("#7 should not allow unknown to set entry creation fee", async () => {
        const newFee = randomFee()
        const oldFee = new BigNumber(await registry.entryCreationFee())

        await registry.setEntryCreationFee(newFee, { from: UNKNOWN }).should.be.rejected

        const fee = new BigNumber(await registry.entryCreationFee())
        fee.should.bignumber.equal(oldFee)
    })

    it("#8 should allow registry owner to set permission type", async () => {
        await registry.setPermissionType(PermissionType.OnlyOwner, { from: REGISTRY_OWNER })

        const permissionType = new BigNumber(await registry.permissionType())
        permissionType.should.bignumber.equal(PermissionType.OnlyOwner)
    })

    it("#9 should not allow unknown to set permission type", async () => {
        await registry.setPermissionType(PermissionType.All, { from: UNKNOWN }).should.be.rejected

        const permissionType = new BigNumber(await registry.permissionType())
        permissionType.should.bignumber.equal(PermissionType.OnlyOwner)
    })

    function randomFee(){
        return Math.floor(Math.random() * 100)
    }

})