var RegistryBuilder = artifacts.require("./builder/RegistryBuilder.sol");

module.exports = function(deployer) {
  deployer.deploy(RegistryBuilder);
};
