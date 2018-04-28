var RegistryCreator = artifacts.require("RegistryCreator");

module.exports = function(deployer) {
  deployer.deploy(RegistryCreator, 0x0);
};
