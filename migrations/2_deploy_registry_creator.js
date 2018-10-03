var RegistryBuilder = artifacts.require("./chaingear/RegistryBuilder.sol");

module.exports = function(deployer) {
  deployer.deploy(RegistryBuilder);
};
