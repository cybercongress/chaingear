var RegistryBuilder = artifacts.require("RegistryBuilder");
var RegistryCreator = artifacts.require("RegistryCreator");

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
    RegistryBuilder,
    RegistryCreator.address,
    BUILDING_FEE,
    BENEFICIARIES,
    SHARES
  ).then(() => RegistryCreator.deployed())
    .then(creator => creator.setBuilder(RegistryBuilder.address))
};
