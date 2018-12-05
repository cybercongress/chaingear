pragma solidity 0.4.25;

import "../common/ISchema.sol";
import "../common/ISchemaConnector.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/introspection/SupportsInterfaceWithLookup.sol";


contract AppsSchema is ISchema, Ownable, SupportsInterfaceWithLookup {
    
    bytes4 public constant InterfaceId_Schema = 0xd4b1117d;

    struct Entry {
        string name;
        string manifest;
        string extension;
        string content;
        string logo;
    }
    
    Entry[] public entries;
    
    ISchemaConnector internal database;
    
    constructor()
        public
    {
        _registerInterface(InterfaceId_Schema);
        database = ISchemaConnector(owner);
    }
    
    function() external {} 
    
    function createEntry()
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
        uint256 entryIndex = database.getIndexByID(_entryID);
        return (
            entries[entryIndex].name,
            entries[entryIndex].manifest,
            entries[entryIndex].extension,
            entries[entryIndex].content,
            entries[entryIndex].logo
        );
    }

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
        database.auth(_entryID, msg.sender);
        
        uint256 entryIndex = database.getIndexByID(_entryID);
            
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
        uint256 lastEntryIndex = entries.length - 1;
        Entry memory lastEntry = entries[lastEntryIndex];
        
        entries[_entryIndex] = lastEntry;
        delete entries[lastEntryIndex];
        entries.length--;
    }
    
}
