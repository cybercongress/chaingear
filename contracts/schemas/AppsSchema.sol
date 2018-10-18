pragma solidity 0.4.25;

import "../common/IEntry.sol";
import "../common/IConnector.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/introspection/SupportsInterfaceWithLookup.sol";


contract AppsSchema is IEntry, Ownable, SupportsInterfaceWithLookup {
    
    using SafeMath for uint256;
    
    bytes4 public constant InterfaceId_EntryCore = 0xd4b1117d;
    /**
     * 0xd4b1117d ===
     *   bytes4(keccak256('createEntry(uint256)')) ^
     *   bytes4(keccak256('deleteEntry(uint256)')) ^
     *   bytes4(keccak256('getEntriesAmount()')) ^
     *   bytes4(keccak256('getEntriesIDs()'))
     */

    struct Entry {
        string name;
        string manifest;
        string extension;
        string content;
        string logo;
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
    
    function createEntry(uint256)
        external
        onlyOwner
    {
        Entry memory m = (Entry(
        {
            name:       "",
            manifest:   "",
            extension:  "",
            content:    "",
            logo:       ""
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
            string,
            string
        )
    {
        uint256 entryIndex = registry.getIndexByID(_entryID);
        return (
            entries[entryIndex].name,
            entries[entryIndex].manifest,
            entries[entryIndex].extension,
            entries[entryIndex].content,
            entries[entryIndex].logo
        );
    }

    // Example: you can write methods for earch parameter and update them separetly
    function updateEntry(
        uint256 _entryID,
        string  _name,
        string  _manifest,
        string  _extension,
        string  _content,
        string  _logo
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
            name:       _name,
            manifest:   _manifest,
            extension:  _extension,
            content:    _content,
            logo:       _logo
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
