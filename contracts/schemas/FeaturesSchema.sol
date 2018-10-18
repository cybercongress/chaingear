pragma solidity 0.4.25;

import "../common/IEntry.sol";
import "../common/IConnector.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/introspection/SupportsInterfaceWithLookup.sol";


contract FeaturesSchema is IEntry, Ownable, SupportsInterfaceWithLookup {
    
    using SafeMath for uint256;
    
    bytes4 internal constant InterfaceId_EntryCore = 0xd4b1117d;

    struct Entry {
        string name;
        string description;
        string github;
        string maintainer;
    }
    
    mapping(string => bool) internal nameUniqIndex;
    
    Entry[] public entries;
    
    IConnector internal registry;
    
    constructor()
        public
    {
        _registerInterface(InterfaceId_EntryCore);
        registry = IConnector(owner);
    }
    
    function() external {} 
    
    function createEntry()
        external
        onlyOwner
    {
        Entry memory m = (Entry(
        {
            name:           "",
            description:    "",
            github:         "",
            maintainer:     ""
        }));

        entries.push(m);
    }
    
    function readEntry(uint256 _entryID)
        external
        view
        returns (
            string,
            string,
            string,
            string
        )
    {
        uint256 entryIndex = registry.getIndexByID(_entryID);
        return (
            entries[entryIndex].name,
            entries[entryIndex].description,
            entries[entryIndex].github,
            entries[entryIndex].maintainer
        );
    }

    // Example: you can write methods for earch parameter and update them separetly
    function updateEntry(
        uint256 _entryID,
        string  _name,
        string  _description,
        string  _github,
        string  _maintainer
    )
        external
    {
        registry.auth(_entryID, msg.sender);
        
        uint256 entryIndex = registry.getIndexByID(_entryID);
        
        string storage last = entries[entryIndex].name;
        if (last != _name) {
            require(nameUniqIndex[_name] == false);
            nameUniqIndex[_name] = true;
            nameUniqIndex[last] = false;
        }
            
        Entry memory m = (Entry(
        {
            name:        _name,
            description: _description,
            github:      _github,
            maintainer:  _maintainer
        }));
        entries[entryIndex] = m;
    }

    function deleteEntry(uint256 _entryIndex)
        external
        onlyOwner
    {
        require(entries.length > uint256(0));
        
        string storage nameToClear = entries[_entryIndex].name;
        nameUniqIndex[nameToClear] = false;
        
        uint256 lastEntryIndex = entries.length.sub(1);
        Entry memory lastEntry = entries[lastEntryIndex];
        
        entries[_entryIndex] = lastEntry;
        delete entries[lastEntryIndex];
        entries.length--;
    }
    
    // will be removed, now for frontend support
    function getEntriesIDs()
        external
        view
        returns (uint256[])
    {
        return registry.getEntriesIDs();
    }
    
}
