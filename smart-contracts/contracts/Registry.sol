pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "./common/BytesLib.sol";
import "./common/SplitPaymentChangeable.sol";


contract Registry is Destructible, SplitPaymentChangeable {

    using BytesLib for bytes;

    struct TokenEntry {
        address owner;
        uint creationTime;
        uint lastUpdateTime;
        string name;
        string ticker;
    }
  
    enum PermissionType {OnlyOwner, AllUsers}
  
    string public name;
    string public description;
    string public tags;
    PermissionType public permissionType;
    uint public entryCreationFee;
    TokenEntry[] public entries;

    event EntryCreated(address owner, uint entryId);
    event EntryDeleted(uint entryId);
    event EntryUpdated(uint entryId, address owner, string name, string ticker);
  
    function Registry(
        address[] _benefitiaries,
        uint256[] _shares,
        PermissionType _permissionType,
        uint _entryCreationFee
    ) SplitPaymentChangeable(_benefitiaries, _shares) public
    {
        permissionType = _permissionType;
        entryCreationFee = _entryCreationFee;
    }
  
    function createEntry(string _name, string _ticker) external payable {
        require(msg.sender == owner || msg.value == entryCreationFee);
        require(msg.sender == owner || permissionType == PermissionType.AllUsers);
    
        entries.push(TokenEntry(
        {
            owner: msg.sender,
            creationTime: now,
            lastUpdateTime: now,
            name: _name,
            ticker: _ticker
        }));
    
        EntryCreated(msg.sender, entries.length - 1);
    }

    function updateEntry(uint _entryId, address _owner, string _name, string _ticker) external {
        require(entries[_entryId].owner == msg.sender);

        entries[_entryId].lastUpdateTime = now;
        entries[_entryId].owner = _owner;
        entries[_entryId].name = _name;
        entries[_entryId].ticker = _ticker;

        EntryUpdated(_entryId, _owner, _name, _ticker);
    }
  
    function deleteEntry(uint _entryId) external {
        require(entries[_entryId].owner == msg.sender);

        delete entries[_entryId];

        EntryDeleted(_entryId);
    }

    function isDeleted(uint _entryId) external constant returns (bool) {
        return entries[_entryId].owner == 0x0;
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

    function setName(string _name) external onlyOwner {
        uint len = bytes(_name).length;
        require(len > 0 && len <= 32);

        name = _name;
    }

    function setDescription(string _description) external onlyOwner {
        uint len = bytes(_description).length;
        require(len <= 256);

        description = _description;
    }

    function setTags(string _tags) external onlyOwner {
        uint len = bytes(_tags).length;
        require(len <= 64);

        tags = _tags;
    }
}
