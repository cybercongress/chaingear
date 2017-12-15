pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";


contract Registry is Destructible {

    struct Entry {
        address addr;
        address owner;
    }
  
    enum PermissionType {OnlyOwner, AllUsers}
  
    PermissionType public permissionType;
    uint public entryCreationFee;
    Entry[] public entries;
  
    event EntryCreated(address addr, uint entryId);
    event EntryDeleted(address addr);
  
    function Registry(PermissionType _permissionType, uint _entryCreationFee) public {
        permissionType = _permissionType;
        entryCreationFee = _entryCreationFee;
    }
  
    function createEntry(bytes _bytecode)
      external payable returns (address addr) 
    {
        require(msg.sender == owner || msg.value == entryCreationFee);
        require(msg.sender == owner || permissionType == PermissionType.AllUsers);
    
        bytes memory bytecode = _bytecode; // copy into memory from calldata
        
        assembly {
          let s := mload(bytecode) // bytecode array length
          let p := add(bytecode, 0x20) // bytecode start
          addr := create(0, p, s) // create new contract with code mem[p..(p+s)) and send v wei and return the new address
        }
    
        entries.push(Entry({ addr: addr, owner: msg.sender }));
    
        EntryCreated(addr, entries.length - 1);
    }
  
    function deleteEntry(uint _entryId) external {
        require(entries[_entryId].owner == msg.sender);

        EntryDeleted(entries[_entryId].addr);

        entries[_entryId].addr = 0x0;
        entries[_entryId].owner = 0x0;
    }

    function isDeleted(uint _entryId) external constant returns (bool) {
        return entries[_entryId].addr == 0x0;
    }
  
    function entriesCount() external constant returns (uint) {
        return entries.length;
    }

    function setEntryCreationFee(uint _fee) external onlyOwner {
        entryCreationFee = _fee;
    }

    function setPermissionType(PermissionType _permissionType) external onlyOwner {
        permissionType = _permissionType;
    }
}
