var Chaingear = artifacts.require("./registry/Chaingear.sol");
var RegistryCreator = artifacts.require("./registry/RegistryCreator.sol");

module.exports = function(deployer, network, accounts) {

  let BUILDING_FEE, BENEFICIARIES, SHARES


  if (network == 'live') {
    // TODO: adjust parameters
    BUILDING_FEE = 1
    BENEFICIARIES = []
    SHARES = []
  } else {
    BUILDING_FEE = 1
    BENEFICIARIES = []
    SHARES = []
  }

  deployer.deploy(
    Chaingear,
    RegistryCreator.address,
    BENEFICIARIES,
    SHARES,
    "Most Expensive Registry",
    1000000,
    "CHAINGEAR",
    "CHG"
  ).then(() => RegistryCreator.deployed())
    .then(creator_ => creator_.setBuilder(Chaingear.address))
};
