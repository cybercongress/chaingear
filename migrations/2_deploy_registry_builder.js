var DatabaseBuilderV1 = artifacts.require("./builders/DatabaseBuilderV1.sol");

module.exports = function(deployer) {
  deployer.deploy(DatabaseBuilderV1);
};
