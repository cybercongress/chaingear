pragma solidity 0.4.24;

// File: contracts/common/EntryInterface.sol

contract EntryInterface {

    function entriesAmount() external view returns (uint256);
    function createEntry() external returns (uint256);
    function deleteEntry(uint256) external;
}

// File: openzeppelin-solidity/contracts/ownership/Ownable.sol

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address public owner;


  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  function Ownable() public {
    owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0));
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

}

// File: contracts/registry/EntryCore.sol

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

        uint256 newEntryID = entries.push(m) - 1;

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
        uint256 lastEntryIndex = entries.length - 1;
        Entry storage lastEntry = entries[lastEntryIndex];

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
