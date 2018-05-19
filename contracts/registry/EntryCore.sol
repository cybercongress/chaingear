pragma solidity 0.4.23;

import "../common/EntryBasic.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

//todo remove from here. Maybe move into /contracts/test??
/**
* @title Entries engine for Chaingear
* @author Cyber•Congress
* @dev not recommend to use before release!
*/
contract EntryCore is EntryBasic, Ownable {

    /*
    * @dev original structure of entry for example
    */
    struct Entry {
        address expensiveAddress;
        uint256 expensiveUint;
        int128 expensiveInt;
        string expensiveString;
    }

    // @dev initial structure of entries
    Entry[] internal entries;

    /**
    * @dev entries amount getter
    * @return uint256
    */
    function entriesAmount()
        public
        view
        returns (uint256 entryID)
    {
        return entries.length;
    }

    function entryInfo(uint256 _entryID)
        public
        view
        returns (
            address, 
            uint256, 
            int128, 
            string
        )
    {
        return (
            entries[_entryID].expensiveAddress,
            entries[_entryID].expensiveUint,
            entries[_entryID].expensiveInt,
            entries[_entryID].expensiveString
        );
    }

    /**
    * @dev entry creation method
    * @return uint256
    */
    function createEntry()
        public
        onlyOwner
        returns (uint256 entryId)
    {
        // check new 
        Entry memory entry = (Entry(
        {
            expensiveAddress: address(0),
            expensiveUint: uint256(0),
            expensiveInt: int128(0),
            expensiveString: ""
        }));

        uint256 newEntryId = entries.push(entry) - 1;

        return newEntryId;
    }

    /**
    * @dev Entry custom information setter
    * @notice custom variables
    */
    function updateEntry(
        uint256 _entryID, 
        address _newAddress, 
        uint256 _newUint, 
        int128 _newInt, 
        string _newString
    )
        public
    {
        require(owner.call(bytes4(keccak256("updateEntry(uint256)")), _entryID));
        entries[_entryID].expensiveAddress = _newAddress;
        entries[_entryID].expensiveUint = _newUint;
        entries[_entryID].expensiveInt = _newInt;
        entries[_entryID].expensiveString = _newString;
    }

    /**
    * @dev remove entry method
    * @param _entryIndex uint256
    */
    function deleteEntry(uint256 _entryIndex)
        onlyOwner
        public
    {
        uint256 lastEntryIndex = entries.length - 1;
        Entry storage lastEntry = entries[lastEntryIndex];

        entries[_entryIndex] = lastEntry;
        delete entries[lastEntryIndex];
        entries.length--;
    }

}
