var RegistryCreator = artifacts.require("./chaingear/RegistryCreator.sol");

module.exports = function(deployer) {
  deployer.deploy(RegistryCreator);
};
