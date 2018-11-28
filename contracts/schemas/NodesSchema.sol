pragma solidity 0.4.25;

import "../common/ISchema.sol";
import "../common/ISchemaConnector.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/introspection/SupportsInterfaceWithLookup.sol";


contract NodesSchema is ISchema, Ownable, SupportsInterfaceWithLookup {
    
    // bytes4 internal constant InterfaceId_EntryCore = 0xd4b1117d;

    struct Entry {
        string  name;
        string  addressNode;
        string  services;
        string  description;
        string  operating;
    }
    
    Entry[] public entries;
    
    ISchemaConnector internal database;
    
    constructor()
        public
    {
        // _registerInterface(InterfaceId_EntryCore);
        database = ISchemaConnector(owner);
    }
    
    function() external {} 
    
    function createEntry()
        external
        onlyOwner
    {
        Entry memory m = (Entry(
        {
            name:           "",
            addressNode:    "",
            services:       "",
            description:    "",
            operating:      ""
    
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
            entries[entryIndex].addressNode,
            entries[entryIndex].services,
            entries[entryIndex].description,
            entries[entryIndex].operating
        );
    }

    function updateEntry(
        uint256 _entryID,
        string  _name,
        string _addressNode,
        string _services,
        string _description,
        string _operating
    )
        external
    {
        database.auth(_entryID, msg.sender);
        
        uint256 entryIndex = database.getIndexByID(_entryID);
            
        Entry memory m = (Entry(
        {
            name:           _name,
            addressNode:    _addressNode,
            services:       _services,
            description:    _description,
            operating:      _operating
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
