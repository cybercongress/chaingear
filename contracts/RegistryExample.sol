pragma solidity ^0.4.17;

import "./common/chaingeareable.sol";


contract RegistryExample is Chaingeareable {

    //codegeneration
    struct EntryExample {
        address expensiveAddress;
        uint expensiveUint;
        int expensiveInt;
        string expensiveString;

        //inbox fields
        address owner;
        uint lastUpdateTime;
    }

    EntryExample[] public entries;

    event EntryCreated(address owner, uint entryId);
    event EntryDeleted(uint entryId);
    event EntryUpdated(uint entryId, address owner);
    event EntryChangedOwner(uint entryId, address newOwner);

    function RegistryExample(
        address[] _benefitiaries,
        uint256[] _shares,
        PermissionType _permissionType,
        uint _entryCreationFee,
        string _linkABI,
        string _linkMeta,
        string _name,
        string _description,
        string _tags
    ) Chaingeareable(_benefitiaries, _shares, _permissionType, _entryCreationFee, _linkABI, _linkMeta, _name, _description, _tags) public
    {

    }

    //codegeneration
    function createEntry(address _expensiveAddress, uint _expensiveUint, int _expensiveInt, string _expensiveString) external payable {
        //permission logic TODO
        require(msg.sender == owner || msg.value == entryCreationFee);
        require(msg.sender == owner || permissionType == PermissionType.AllUsers);

        entries.push(EntryExample(
        {
            owner: msg.sender,
            expensiveAddress: _expensiveAddress,
            expensiveUint: _expensiveUint,
            expensiveInt: _expensiveInt,
            expensiveString: _expensiveString,
            lastUpdateTime: now
        }));

        EntryCreated(msg.sender, entries.length - 1);
    }

    //codegeneration
    //external vs public..
    function updateEntryExpensiveAddress(uint _entryId, address _expensiveAddress) external {
        require(entries[_entryId].owner == msg.sender);
        /* require(_expensiveAddress <= 256); */

        entries[_entryId].lastUpdateTime = now;
        entries[_entryId].expensiveAddress = _expensiveAddress;

        // specified for updates events TODO
        EntryUpdated(_entryId, entries[_entryId].owner);
    }

    function deleteEntry(uint _entryId) external {
        //permission logic TODO
        require(entries[_entryId].owner == msg.sender);

        delete entries[_entryId];

        EntryDeleted(_entryId);
    }

    function isDeletedEntry(uint _entryId) external constant returns (bool) {
        return entries[_entryId].owner == 0x0;
    }

    function entriesCount() external constant returns (uint) {
        return entries.length;
    }

    function transferEntryOwnership(uint _entryId, address _newOnwer) external {
        require(entries[_entryId].owner == msg.sender);

        entries[_entryId].owner = _newOnwer;
        EntryChangedOwner(_entryId, entries[_entryId].owner);
    }
}
