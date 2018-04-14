pragma solidity ^0.4.18;


contract EntryBase {

    struct Entry {
        address expensiveAddress;
        uint expensiveUint;
        int expensiveInt;
        string expensiveString;

        EntryMeta metainformation;
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

    struct EntryMeta {
        address owner;
        address creator;
        uint createdAt;
        uint lastUpdateTime;
        uint currentEntryBalanceETH;
        uint accumulatedOverallEntryETH;
    }
    
    event EntryFunded(
        uint entryId,
        address funder
    );
    
    event EntryFundsClaimed(
        uint entryId,
        address receiver,
        uint amount
    );

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
    
    function registryOwnerOf(uint256 _entryId)
        public
        view
        returns (address)
    {
        entries[_entryId].metainformation.owner;
    }
    
    function creatorOf(uint256 _entryId)
        public
        view
        returns (address)
    {
        entries[_entryId].metainformation.creator;
    }
    
    function createdAtOf(uint256 _entryId)
        public
        view
        returns (uint)
    {
        entries[_entryId].metainformation.createdAt;
    }

    function lastUpdateTimeOf(uint256 _entryId)
        public
        view
        returns (uint)
    {
        return entries[_entryId].metainformation.lastUpdateTime;
    }
    
    function currentEntryBalanceETHOf(uint256 _entryId)
        public
        view
        returns (uint)
    {
        return entries[_entryId].metainformation.currentEntryBalanceETH;
    }
    
    function accumulatedOverallEntryETHOf(uint256 _entryId)
        public
        view
        returns (uint)
    {
        return entries[_entryId].metainformation.accumulatedOverallEntryETH;
    }

    function entryInfo(uint256 _entryId)
        public
        view
        returns (address, uint, int, string)
    {
        return (
            expensiveAddressOf(_entryId),
            expensiveUintOf(_entryId),
            expensiveIntOf(_entryId),
            expensiveStringOf(_entryId)
        );
    }
    
    function entryMeta(uint256 _entryId)
        public
        view
        returns (address, address, uint, uint, uint, uint)
    {
        return (
            registryOwnerOf(_entryId),
            creatorOf(_entryId),
            createdAtOf(_entryId),
            lastUpdateTimeOf(_entryId),
            currentEntryBalanceETHOf(_entryId),
            accumulatedOverallEntryETHOf(_entryId)
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
