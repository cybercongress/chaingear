pragma solidity ^0.4.18;


contract EntryBase {

    struct Entry {
        address expensiveAddress;
        uint expensiveUint;
        int expensiveInt;
        string expensiveString;

        //inbox fields
        address owner;
        uint lastUpdateTime;
    }

    Entry[] internal entries;

    event EntryCreated(
        address creator,
        uint entryId
    );

    event EntryUpdated(
        address owner,
        uint entryId
    );

    event EntryChangedOwner(
        uint entryId,
        address newOwner
    );

    event EntryDeleted(
        address owner,
        uint entryId
    );

    /* struct EntryMeta {
       address creator;
       uint createdAt;
       uint lastUpdateTime;
       uint currentEntryBalanceETH;
       uint accumulatedOverallEntryEth;
    }

    EntryMeta[] entriesMeta;
    mapping (uint256 => EntryMeta) entriesMetaIndex; */

    function expensiveAddressOf(uint256 _entryId)
        public
        view
        returns (address)
    {
        return entries[_entryId].expensiveAddress;
    }

    function expensiveUintOf(uint256 _entryId)
        public
        view
        returns (uint)
    {
        return entries[_entryId].expensiveUint;
    }

    function expensiveIntOf(uint256 _entryId)
        public
        view
        returns (int)
    {
        return entries[_entryId].expensiveInt;
    }

    function expensiveStringOf(uint256 _entryId)
        public
        view
        returns (string)
    {
        return entries[_entryId].expensiveString;
    }

    function lastUpdateTimeOf(uint256 _entryId)
        public
        view
        returns (uint)
    {
        return entries[_entryId].lastUpdateTime;
    }

    function entryInfo(uint256 _entryId)
        public
        view
        returns (address, uint, int, string, uint)
    {
        return (
            expensiveAddressOf(_entryId),
            expensiveUintOf(_entryId),
            expensiveIntOf(_entryId),
            expensiveStringOf(_entryId),
            lastUpdateTimeOf(_entryId)
        );
    }

    function entriesAmount()
        public
        view
        returns (uint256)
    {
        return entries.length;
    }

}
