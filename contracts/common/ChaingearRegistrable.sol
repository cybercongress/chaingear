pragma solidity ^0.4.18;


contract ChaingearRegistrable {

    address public owner;

    function implementsChaingearedRegistry() public view returns (bool);

    function setChaingearMode(address _originAddress, bool _mode) public returns (bool);

    function chaingearModeStatus() public view returns (bool);

    function getChaingeareableVersion() public view returns (bytes32);

    function transferTokenizedOnwerhip(address _originAddress, address newOwner) public returns (bool);
}
