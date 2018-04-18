pragma solidity ^0.4.18;

import "github.com/OpenZeppelin/zeppelin-solidity/contracts/ownership/Ownable.sol";
import "github.com/pouladzade/Seriality/src/Seriality.sol";
import "./EntryBase.sol";


contract Entry is EntryBase {

    struct Entry {
        address expensiveAddress;
        uint256 expensiveUint;
        int128 expensiveInt;
        string expensiveString;

        EntryMeta metainformation;
    }

    Entry[] internal entries;
    
    // event EntryFunded(
    //     uint entryId,
    //     address funder
    // );
    
    // event EntryFundsClaimed(
    //     uint entryId,
    //     address receiver,
    //     uint amount
    // );

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
        returns (uint256)
    {
        return entries[_entryId].expensiveUint;
    }

    function expensiveIntOf(uint256 _entryId)
        public
        view
        returns (int128)
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

    function entryInfo(uint256 _entryId)
        public
        view
        returns (address, uint256, int128, string)
    {
        return (
            expensiveAddressOf(_entryId),
            expensiveUintOf(_entryId),
            expensiveIntOf(_entryId),
            expensiveStringOf(_entryId)
        );
    }

    function entriesAmount()
        public
        view
        returns (uint256)
    {
        return entries.length;
    }
    
    function createEntry(bytes _serializedParams)
        public
        onlyOwner
        returns (uint256 entryId)
    {
        uint offset = _serializedParams.length;
        
        _expensiveAddress = bytesToAddress(offset, _serializedParams);
        offset -= sizeOfAddress();
        
        _expensiveUint = bytesToUint256(offset, _serializedParams);
        offset -= sizeOfUint(256);
        
        _expensiveInt = bytesToInt128(offset, _serializedParams);
        offset -= sizeOfInt(128);
        
        _expensiveString = new string(32);
        bytesToString(offset, _serializedParams, bytes(_expensiveString));
        
        EntryMeta memory meta = (EntryMeta(
        {
            lastUpdateTime: block.timestamp,
            createdAt: block.timestamp,
            owner: tx.origin,
            creator: tx.origin
            // currentEntryBalanceETH: 0,
            // accumulatedOverallEntryETH: 0
        }));
        
        Entry memory entry = (Entry(
        {
            expensiveAddress: _expensiveAddress,
            expensiveUint: _expensiveUint,
            expensiveInt: _expensiveInt,
            expensiveString: _expensiveString,
            metainformation: meta
        }));
        
        uint256 newEntryId = entries.push(entry) - 1;
        
        EntryCreated(tx.origin. newEntryId);
        
        return newEntryId;
    }   
    
    // function updateEntry(bytes _serializedParams)
    //     public
    //     onlyOwner
    // {
        
    // } 
    
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

}
