var Chaingear = artifacts.require("./Chaingear.sol");

module.exports = function(deployer) {
  deployer.deploy(Chaingear,
    ["0xa3564D084fabf13e69eca6F2949D3328BF6468Ef"],
    [100],
    "Chaingear main contract",
    "todo",
    100000,
    "CHG"
  );
};
