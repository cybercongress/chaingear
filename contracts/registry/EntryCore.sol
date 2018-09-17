pragma solidity 0.4.24;

import "../common/EntryInterface.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


//This is Example of EntryCore
contract EntryCore is EntryInterface, Ownable {

    struct Entry {
        address expensiveAddress;
        uint256 expensiveUint;
        int128 expensiveInt;
        string expensiveString;
    }
    
    mapping(string => bool) internal entryExpensiveStringIndex;
    
    Entry[] internal entries;
    
    function() external {}
    
    function createEntry()
        external
        onlyOwner
        returns (uint256)
    {
        Entry memory m = (Entry(
        {
            expensiveAddress: address(0),
            expensiveUint: uint256(0),
            expensiveInt: int128(0),
            expensiveString: ""
        }));

	//// [review] not sure if not using .length is OK!
        uint256 newEntryID = entries.push(m) - 1;

	//// [review] Use "return (entries.length - 1);" instead
        return newEntryID;
    }

    function updateEntry(
        uint256 _entryID, 
        address _newAddress, 
        uint256 _newUint, 
        int128 _newInt, 
        string _newString
    )
        external
    {
        require(owner.call(bytes4(keccak256("checkAuth(uint256, address)")), _entryID, msg.sender));
        
        // for uniq check example
        require(entryExpensiveStringIndex[_newString] == false);
        // for uniq check example
        entryExpensiveStringIndex[_newString] = true;
        string storage lastIndexValue = entries[_entryID].expensiveString;
        entryExpensiveStringIndex[lastIndexValue] = false;
        
            
        Entry memory m = (Entry({
            expensiveAddress: _newAddress,
            expensiveUint: _newUint,
            expensiveInt: _newInt,
            expensiveString: _newString
        }));
        entries[_entryID] = m;
        
        require(owner.call(bytes4(keccak256("updateEntryTimestamp(uint256)")), _entryID));
    }

    function deleteEntry(
        uint256 _entryIndex
    )
        external
        onlyOwner
    {
	//// [review] BUG: not checking if current len is 0!!!
	//// [review] BUG: not using SafeMath. Can overflow
        uint256 lastEntryIndex = entries.length - 1;
        Entry storage lastEntry = entries[lastEntryIndex];

	//// [review] BUG: not checking the _index
        entries[_entryIndex] = lastEntry;
        delete entries[lastEntryIndex];
        entries.length--;
    }

    function entriesAmount()
        external
        view
        returns (uint256 entryID)
    {
        return entries.length;
    }

    function entryInfo(
        uint256 _entryID
    )
        external
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
