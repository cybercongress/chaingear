var RegistryCreator = artifacts.require("./registry/RegistryCreator.sol");

module.exports = function(deployer) {
  deployer.deploy(RegistryCreator);
};
