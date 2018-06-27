pragma solidity 0.4.24;

import "../common/EntryBasic.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
* @title Entries engine for Chaingear
* @author Cyber•Congress
* @dev not recommend to use before release!
*/
contract EntryCore is EntryBasic, Ownable {

    /*
    *  Storage
    */

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

    /*
    *  Public functions
    */

    /**
    * @dev entry creation method
    * @return uint256
    */
    function createEntry()
        public
        onlyOwner
        returns (
            uint256
        )
    {
        // check new 
        Entry memory entry = (Entry(
        {
            expensiveAddress: address(0),
            expensiveUint: uint256(0),
            expensiveInt: int128(0),
            expensiveString: ""
        }));

        uint256 newEntryID = entries.push(entry) - 1;

        return newEntryID;
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
        bool status = owner.call(bytes4(keccak256("checkAuth(uint256, address)")), _entryID, msg.sender);
        require(status == true);
        
        entries[_entryID].expensiveAddress = _newAddress;
        entries[_entryID].expensiveUint = _newUint;
        entries[_entryID].expensiveInt = _newInt;
        entries[_entryID].expensiveString = _newString;
        
        require(owner.call(bytes4(keccak256("updateEntryTimestamp(uint256)")), _entryID));
    }

    /**
    * @dev remove entry method
    * @param _entryIndex uint256
    */
    function deleteEntry(
        uint256 _entryIndex
    )
        public
        onlyOwner
    {
        uint256 lastEntryIndex = entries.length - 1;
        Entry storage lastEntry = entries[lastEntryIndex];

        entries[_entryIndex] = lastEntry;
        delete entries[lastEntryIndex];
        entries.length--;
    }

    /*
    *  View functions
    */

    /**
    * @dev entries amount getter
    * @return uint256
    */
    function entriesAmount()
        public
        view
        returns (
            uint256 entryID
        )
    {
        return entries.length;
    }

    function entryInfo(
        uint256 _entryID
    )
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

}
