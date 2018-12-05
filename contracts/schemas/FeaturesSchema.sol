pragma solidity 0.4.25;

import "../common/ISchema.sol";
import "../common/IDatabase.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/introspection/SupportsInterfaceWithLookup.sol";


contract FeaturesSchema is ISchema, Ownable, SupportsInterfaceWithLookup {
    
    bytes4 constant internal INTERFACE_SCHEMA_ID = 0x153366ed;

    struct Entry {
        string name;
        string description;
        string github;
        string maintainer;
    }
    
    Entry[] public entries;
    
    IDatabase internal database;
    
    constructor()
        public
    {
        _registerInterface(INTERFACE_SCHEMA_ID);
        database = IDatabase(owner);
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
        uint256 entryIndex = database.getIndexByID(_entryID);
        return (
            entries[entryIndex].name,
            entries[entryIndex].description,
            entries[entryIndex].github,
            entries[entryIndex].maintainer
        );
    }

    function updateEntry(
        uint256 _entryID,
        string  _name,
        string  _description,
        string  _github,
        string  _maintainer
    )
        external
    {
        database.auth(_entryID, msg.sender);
        
        uint256 entryIndex = database.getIndexByID(_entryID);
            
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
        uint256 lastEntryIndex = entries.length - 1;
        Entry memory lastEntry = entries[lastEntryIndex];
        
        entries[_entryIndex] = lastEntry;
        delete entries[lastEntryIndex];
        entries.length--;
    }
    
}
