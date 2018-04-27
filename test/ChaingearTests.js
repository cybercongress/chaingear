const BigNumber = require("bignumber.js")
const chai = require("chai")
chai.use(require("chai-bignumber")())
chai.use(require("chai-as-promised"))
chai.should()

const Registry = artifacts.require("Registry")
const Chaingear = artifacts.require("Chaingear")
const RegistryCreator = artifacts.require("RegistryCreator")
const EntryCore = artifacts.require("EntryCore")

contract("Chaingear", (accounts) => {

    // const PermissionType = {
    //     OnlyOwner: 0,
    //     All: 1
    // }

    let chaingear, creator

    const BUILDING_FEE = 3
    const CREATION_FEE = 1
    const CREATION_GAS = 8000000
    const CHAINGEAR_OWNER = accounts[0]
    const CREATOR = accounts[1]
    
    const CHAINGEAR_DESCRIPTION = "Most Expensive Registry"
    const CHAINGEAR_NAME = "CHAINGEAR"
    const CHAINGEAR_SYMBOL = "CHG"
    
    const REGISTRY_NAME = "EXPENSIVE_REGISTRY"
    const REGISTRY_SYMBOL = "EXP"
    const IPFS_HASH_1 = "HASH1"

    before(async () => {
        creator = await RegistryCreator.new({ from: CHAINGEAR_OWNER })
        
        chaingear = await Chaingear.new(
            creator.address,
            [],
            [],
            CHAINGEAR_DESCRIPTION,
            BUILDING_FEE,
            CHAINGEAR_NAME,
            CHAINGEAR_SYMBOL,
            { from: CHAINGEAR_OWNER }
        )

        await creator.setBuilder(
            chaingear.address, 
            {
                from: CHAINGEAR_OWNER 
            })
    })

    it("#1 should allow to build new registry", async () => {
        const res = await chaingear.registerRegistry(
            [],
            [],
            REGISTRY_NAME,
            REGISTRY_SYMBOL,
            IPFS_HASH_1,
            EntryCore.bytecode,
            { from: CREATOR, value: BUILDING_FEE, gas: CREATION_GAS }
        )
        
        console.log("Gas used: " + res.receipt.gasUsed)

        const entriesAmount = await chaingear.registriesAmount()
        
        const createdAddress = await chaingear.contractAddressOf(entriesAmount-1)
        const registry = Registry.at(createdAddress)
        const name = await registry.name()
        
        name.should.equal(REGISTRY_NAME)
    })
})
