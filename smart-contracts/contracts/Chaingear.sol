pragma solidity ^0.4.18;

contract Chaingear  {
  struct ContractItem {
    string name;
    address contractAddress;
  }

  ContractItem[] public contracts;
  event EntryCreated(address owner, uint entryId);

  function register(string _name, address _address) external {

        contracts.push(ContractItem(
        {
            name: _name,
            contractAddress: _address
        }));
    
        EntryCreated(msg.sender, contracts.length - 1);
  }

  

    function contractsLength() constant public returns (uint) {
        return contracts.length;
    }
}
