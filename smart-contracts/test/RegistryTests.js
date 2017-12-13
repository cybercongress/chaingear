const BigNumber = require("bignumber.js")
const chai = require("chai")
chai.use(require("chai-bignumber")())
chai.use(require("chai-as-promised"))
chai.should()

const Registry = artifacts.require("Registry.sol")

contract("Registry", (accounts) => {

    const PermissionType = {
        OnlyOwner: 0,
        All: 1
    }

    const REGISTRY_OWNER = accounts[0]
    const ENTRY_OWNER = accounts[1]
    const UNKNOWN = accounts[2]
    const CREATION_FEE = 1

    let registry

    before(async () => {
        registry = await Registry.new(
            PermissionType.All,
            CREATION_FEE,
            { from: REGISTRY_OWNER }
        )
    })


    it("#1 should allow to create new entry", async () => {
        const count1 = new BigNumber(await registry.entriesCount())
        await registry.createEntry('0x42', { from: ENTRY_OWNER })
        const count2 = new BigNumber(await registry.entriesCount())

        count2.should.bignumber.equal(count1.add(1))

        const entry = await registry.entries(count1)
        web3.eth.getCode(entry[0]).should.not.equal('0x0')
    })

    it("#2 should not allow unknown to create entry if permission type = OnlyOwner", async () => {
        const registry2 = await Registry.new(
            PermissionType.OnlyOwner,
            CREATION_FEE,
            { from: REGISTRY_OWNER }
        )

        const count1 = new BigNumber(await registry2.entriesCount())
        await registry2.createEntry('0x42', { from: ENTRY_OWNER }).should.be.rejected
        const count2 = new BigNumber(await registry2.entriesCount())

        count2.should.bignumber.equal(count1)
    })

    it("#3 should allow entry owner to delete entry", async () => {
        const count1 = new BigNumber(await registry.entriesCount())
        await registry.deleteEntry(count1, { from: ENTRY_OWNER })

        const entry = await registry.entries(count1.sub(1))

        entry[0].should.equal('0x0000000000000000000000000000000000000000')
    })

    it("#4 should not allow unknown to delete entry", async () => {
        const count1 = new BigNumber(await registry.entriesCount())
        await registry.deleteEntry(count1, { from: UNKNOWN }).should.be.rejected

        const entry = await registry.entries(count1.sub(1))

        entry[0].should.equal('0x0000000000000000000000000000000000000000')
    })

    it("#5 should allow registry owner to set entry creation fee", async () => {
        const newFee = 14
        await registry.setEntryCreationFee(newFee, { from: REGISTRY_OWNER })

        const fee = new BigNumber(await registry.entryCreationFee())
        fee.should.bignumber.equal(newFee)
    })


    it("#6 should not allow unknown to set entry creation fee", async () => {
        const newFee = 14
        await registry.setEntryCreationFee(newFee, { from: UNKNOWN }).should.be.rejected

        const fee = new BigNumber(await registry.entryCreationFee())
        fee.should.bignumber.equal(CREATION_FEE)
    })

})