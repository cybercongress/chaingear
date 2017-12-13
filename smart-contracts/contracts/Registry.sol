pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";


contract Registry is Destructible {

  struct Entry{
    address addr;
    address owner;
  }

  enum PermissionType {OnlyOwner, AllUsers}

  PermissionType public permissionType;

  uint public entryCreationFee;

  Entry[] public entries;

  function Registry(PermissionType _permissionType, uint _entryCreationFee) public {
    permissionType = _permissionType;
    entryCreationFee = _entryCreationFee;
  }

  modifier restricted(uint _entryId) {
    _;
  }

  function createEntry(bytes _parameters)
    external payable returns (address) 
  {
    entries.push(Entry({
      addr: 0x1,
      owner: 0x0
    }));
    return 0x0;
  }

  function deleteEntry(uint _entryId) 
    external returns (bool deleted)
  {
    return true;
  }

  function entriesCount() external constant returns (uint){
    return entries.length;
  }

  function setEntryCreationFee(uint _fee) external {
    
  }
}
