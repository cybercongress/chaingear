pragma solidity 0.4.25;

import "../common/IEntry.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/introspection/SupportsInterfaceWithLookup.sol";

interface IRegistrySchema {
    function getIndexByID(uint256) external view returns (uint256);
    function getEntriesIDs() external view returns (uint256[]);
    function updateEntryTimestamp(uint256) external;
    function checkEntryOwnership(uint256, address) external;
}

contract Ports is IEntry, Ownable, SupportsInterfaceWithLookup {
    
    using SafeMath for uint256;
    
    bytes4 internal constant InterfaceId_EntryCore = 0xd4b1117d;

    struct Entry {
        string  portName;
        uint16  portNumber;
        string  service;
    }
    
    mapping(string => bool) internal portNameUniqIndex;
    
    Entry[] public entries;
    
    constructor()
        public
    {
        _registerInterface(InterfaceId_EntryCore);
    }
    
    function() external {} 
    
    function createEntry(uint256 _entryID)
        external
        onlyOwner
    {
        Entry memory m = (Entry(
        {
            portName:   "",
            portNumber: uint16(0),
            service:   ""
        }));

        entries.push(m);
        // allEntriesIndex[_entryID] = allTokens.length;
        // allTokens.push(_entryID);
    }
    
    function readEntry(uint256 _entryID)
        external
        view
        returns (
            string,
            uint16,
            string
        )
    {
        uint256 entryIndex = IRegistrySchema(owner).getIndexByID(_entryID);
        return (
            entries[entryIndex].portName,
            entries[entryIndex].portNumber,
            entries[entryIndex].service
        );
    }

    // Example: you can write methods for earch parameter and update them separetly
    function updateEntry(
        uint256 _entryID,
        string  _portName,
        uint16  _portNumber,
        string  _service
    )
        external
    {
        IRegistrySchema(owner).checkEntryOwnership(_entryID, msg.sender);
        
        //before we check that value already exist, then set than name used and unset previous value
        require(portNameUniqIndex[_portName] == false);
        portNameUniqIndex[_portName] = true;
        
        uint256 entryIndex = IRegistrySchema(owner).getIndexByID(_entryID);
        
        string storage lastName = entries[entryIndex].portName;
        portNameUniqIndex[lastName] = false;
            
        Entry memory m = (Entry(
        {
            portName:   _portName,
            portNumber: _portNumber,
            service:    _service
        }));
        entries[entryIndex] = m;
        
        IRegistrySchema(owner).updateEntryTimestamp(_entryID);
    }

    function deleteEntry(uint256 _entryID)
        external
        onlyOwner
    {
        require(entries.length > uint256(0));
        uint256 entryIndex = IRegistrySchema(owner).getIndexByID(_entryID);
        
        string storage nameToClear = entries[entryIndex].portName;
        portNameUniqIndex[nameToClear] = false;
        
        uint256 lastEntryIndex = entries.length.sub(1);
        Entry memory lastEntry = entries[lastEntryIndex];
        
        entries[entryIndex] = lastEntry;
        delete entries[lastEntryIndex];
        entries.length--;
    }

    function getEntriesAmount()
        external
        view
        returns (uint256)
    {
        return entries.length;
    }
    
    function getEntriesIDs()
        external
        view
        returns (uint256[])
    {
        return IRegistrySchema(owner).getEntriesIDs();
    }
    
}
