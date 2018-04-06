pragma solidity ^0.4.18;


contract ChaingearRegistreable {

    function registerRegistry(string _name, string _linkABI, address _address) public payable returns (uint256 registryId);

}
