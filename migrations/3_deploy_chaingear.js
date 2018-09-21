var Chaingear = artifacts.require("./chaingear/Chaingear.sol");
var RegistryCreator = artifacts.require("./chaingear/RegistryCreator.sol");

module.exports = function(deployer, network, accounts) {
    
    let BUILDING_FEE, BENEFICIARIES, SHARES
    var creator
    
    
    if (network == 'live' || 'kovan') {
        // TODO: adjust parameters
        BUILDING_FEE = 0
        BENEFICIARIES = []
        SHARES = []
    } else {
        BUILDING_FEE = 100000
        BENEFICIARIES = [accounts[0], accounts[1]]
        SHARES = [50, 50]
    }
    
    deployer.deploy(
        Chaingear,
        "CHAINGEAR",
        "CHG",
        BENEFICIARIES,
        SHARES,
        "Most Expensive Registry",
        BUILDING_FEE
    ).then(() => RegistryCreator.deployed())
    .then(_creator => {
        creator = _creator,
        creator.setBuilder(Chaingear.address)
    })
    .then(() => Chaingear.deployed())
    .then(chaingear => chaingear.addRegistryCreatorVersion(
        "V1",
        creator.address,
        "IPFS_HASH_1",
        "Test version of Registry"
    ))
};
