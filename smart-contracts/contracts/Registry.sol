pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";


contract Registry is Destructible {

  enum PermissionType {OnlyOwner, AllUsers}

  PermissionType public permissionType;

  uint public entryCreationFee;

  address[] public entries;

  address[] public entriesOwner;

  function Registry() public {
    // constructor
  }

  modifier restricted(address entryAddress) {
    _;
  }

  function createEntry(bytes parameters)
    external payable restricted(0x0) returns (address) 
  {
    return 0x0;
  }

  function deleteEntry(address entryAddress) 
    external restricted(entryAddress) returns (bool deleted)
  {
    return true;
  }

  function setEntryCreationFee(uint _fee) onlyOwner external {
    
  }
}
