var Chaingear = artifacts.require("./chaingear/Chaingear.sol");
var RegistryBuilder = artifacts.require("./builder/RegistryBuilder.sol");

module.exports = function(deployer, network, accounts) {
    
    let BUILDING_FEE, BENEFICIARIES, SHARES
    var builder
    
    
    if (network == 'kovan') {
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
    ).then(() => RegistryBuilder.deployed())
    .then(_builder => {
        builder = _builder,
        builder.setChaingearAddress(Chaingear.address)
    })
    .then(() => Chaingear.deployed())
    .then(chaingear => chaingear.addRegistryBuilderVersion(
        "V1",
        builder.address,
        "IPFS_HASH_1",
        "Test version of Registry"
    ))
};
