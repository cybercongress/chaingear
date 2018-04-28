pragma solidity 0.4.21;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../common/EntryBasic.sol";


contract EntryCore is EntryBasic, Ownable {

    using SafeMath for uint256;

    struct Entry {
        address expensiveAddress;
        uint256 expensiveUint;
        int128 expensiveInt;
        string expensiveString;

        EntryMeta metainformation;
    }

    Entry[] internal entries;

    modifier onlyEntryOwner(uint256 _entryId) {
        require(entries[_entryId].metainformation.owner == msg.sender);
        _;
    }

    function entriesAmount()
        public
        view
        returns (uint256 entryID)
    {
        return entries.length;
    }

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

    function createEntry()
        public
        onlyOwner
        returns (uint256 entryId)
    {
        EntryMeta memory meta = (EntryMeta(
        {
            lastUpdateTime: block.timestamp,
            createdAt: block.timestamp,
            owner: tx.origin,
            creator: tx.origin,
            currentEntryBalanceETH: 0,
            accumulatedOverallEntryETH: 0
        }));

        Entry memory entry = (Entry(
        {
            expensiveAddress: address(0),
            expensiveUint: uint256(0),
            expensiveInt: int128(0),
            expensiveString: "",
            metainformation: meta
        }));

        uint256 newEntryId = entries.push(entry) - 1;

        return newEntryId;
    }

    function updateEntry(uint256 _entryId, address _newAddress, uint256 _newUint, int128 _newInt, string _newString)
        onlyEntryOwner(_entryId)
        public
    {
        entries[_entryId].expensiveAddress = _newAddress;
        entries[_entryId].expensiveUint = _newUint;
        entries[_entryId].expensiveInt = _newInt;
        entries[_entryId].expensiveString = _newString;

        entries[_entryId].metainformation.lastUpdateTime = block.timestamp;
    }

    function deleteEntry(uint256 _entryIndex)
        onlyOwner
        public
    {
        uint256 lastEntryIndex = entries.length.sub(1);
        Entry storage lastEntry = entries[lastEntryIndex];

        entries[_entryIndex] = lastEntry;
        delete entries[lastEntryIndex];
        entries.length--;
    }

    function updateEntryOwnership(uint256 _entryID, address _newOwner)
        onlyOwner
        public
    {
        entries[_entryID].metainformation.owner = _newOwner;
    }

    function updateEntryFund(uint256 _entryID, uint256 _amount)
        onlyOwner
        public
    {
        entries[_entryID].metainformation.accumulatedOverallEntryETH.add(_amount);
    }

    function claimEntryFund(uint256 _entryID, uint256 _amount)
        onlyOwner
        public
    {
        entries[_entryID].metainformation.currentEntryBalanceETH.sub(_amount);
    }

    function entryOwnerOf(uint256 _entryID)
        public
        view
        returns (address)
    {
        entries[_entryID].metainformation.owner;
    }

    function creatorOf(uint256 _entryID)
        public
        view
        returns (address)
    {
        entries[_entryID].metainformation.creator;
    }

    function createdAtOf(uint256 _entryID)
        public
        view
        returns (uint)
    {
        entries[_entryID].metainformation.createdAt;
    }

    function lastUpdateTimeOf(uint256 _entryID)
        public
        view
        returns (uint)
    {
        return entries[_entryID].metainformation.lastUpdateTime;
    }

    function currentEntryBalanceETHOf(uint256 _entryID)
        public
        view
        returns (uint)
    {
        return entries[_entryID].metainformation.currentEntryBalanceETH;
    }

    function accumulatedOverallEntryETHOf(uint256 _entryID)
        public
        view
        returns (uint)
    {
        return entries[_entryID].metainformation.accumulatedOverallEntryETH;
    }

}
