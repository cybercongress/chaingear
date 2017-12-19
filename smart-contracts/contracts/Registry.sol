pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "./common/BytesLib.sol";
import "./common/MultipleBeneficiaries.sol";


contract Registry is Destructible, MultipleBeneficiaries {

    using BytesLib for bytes;

    struct Entry {
        address addr;
        address owner;
    }
  
    enum PermissionType {OnlyOwner, AllUsers}
  
    PermissionType public permissionType;
    uint public entryCreationFee;
    Entry[] public entries;
    bytes public bytecode;
  
    event EntryCreated(address addr, uint entryId);
    event EntryDeleted(address addr);
  
    function Registry(
        address[] _benefitiaries,
        uint256[] _shares,
        PermissionType _permissionType,
        uint _entryCreationFee,
        bytes _bytecode
    ) MultipleBeneficiaries(_benefitiaries, _shares) public
    {
        permissionType = _permissionType;
        entryCreationFee = _entryCreationFee;
        bytecode = _bytecode;
    }
  
    function createEntry(bytes _params) external payable returns (address addr) {
        require(msg.sender == owner || msg.value == entryCreationFee);
        require(msg.sender == owner || permissionType == PermissionType.AllUsers);
    
        bytes memory params = _params;                              // copy into memory from calldata
        bytes memory completeBytecode = bytecode.concat(params);    // add constructor params to the end of bytecode
        
        assembly {
          let s := mload(completeBytecode)                          // bytecode array length
          let p := add(completeBytecode, 0x20)                      // bytecode start
          addr := create(0, p, s)                                   // create new contract with code mem[p..(p+s)) and send v wei and return the new address
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
