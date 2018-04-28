const BigNumber = require("bignumber.js")
const chai = require("chai")
chai.use(require("chai-bignumber")())
chai.use(require("chai-as-promised"))
chai.should()

const Registry = artifacts.require("Registry")
const RegistryBuilder = artifacts.require("RegistryBuilder")
const RegistryCreator = artifacts.require("RegistryCreator")
const SampleEntry = artifacts.require("SampleEntry")

contract("RegistryBuilder", (accounts) => {

    const PermissionType = {
        OnlyOwner: 0,
        All: 1
    }

    let builder, creator

    const BUILDING_FEE = 3
    const CREATION_FEE = 1
    const CREATION_GAS = 4000000
    const BUILDER_OWNER = accounts[0]
    const CREATOR = accounts[1]
    const CLIENT = accounts[2]

    before(async () => {
        creator = await RegistryCreator.new(0x0, { from: BUILDER_OWNER })
        
        builder = await RegistryBuilder.new(
            creator.address,
            BUILDING_FEE,
            [],
            [],
            { from: BUILDER_OWNER }
        )

        await creator.setBuilder(builder.address, { from: BUILDER_OWNER })
    })

    it("#1 should allow to build new registry", async () => {
        const res = await builder.createRegistry(
            CLIENT,
            [],
            [],
            PermissionType.All,
            CREATION_FEE,
            SampleEntry.bytecode,
            { from: CREATOR, value: BUILDING_FEE, gas: CREATION_GAS }
        )

        
        console.log("Gas used: " + res.receipt.gasUsed)

        const cratedAddress = await builder.getLastContract({ from: CLIENT })
        const registry = Registry.at(cratedAddress)
        const fee = new BigNumber(await registry.entryCreationFee())
        
        fee.should.bignumber.equal(CREATION_FEE)
    })
})