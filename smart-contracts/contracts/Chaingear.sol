pragma solidity ^0.4.18;

contract Chaingear  {
  struct ContractItem {
    string name;
    address contractAddress;
    string ipfsHash;
  }

  ContractItem[] public contracts;
  event EntryCreated(address owner, uint entryId);

  function register(string _name, address _address, string _ipfsHash) external {

        contracts.push(ContractItem(
        {
            name: _name,
            contractAddress: _address,
            ipfsHash: _ipfsHash
        }));
    
        EntryCreated(msg.sender, contracts.length - 1);
  }

  

    function contractsLength() constant public returns (uint) {
        return contracts.length;
    }
}
