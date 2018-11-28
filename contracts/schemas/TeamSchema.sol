pragma solidity 0.4.25;

import "../common/ISchema.sol";
import "../common/ISchemaConnector.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/introspection/SupportsInterfaceWithLookup.sol";


contract TeamSchema is ISchema, Ownable, SupportsInterfaceWithLookup {
    
    // bytes4 public constant InterfaceId_EntryCore = 0xd4b1117d;

    struct Entry {
        string  name;
        address gitcoin;
        address payouts;
        string  github;
        string  telegram;
        string  keybase;
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
            name:       "",
            gitcoin:    address(0),
            payouts:    address(0),
            github:     "",
            telegram:   "",
            keybase:    ""
        }));

        entries.push(m);
    }
    
    function readEntry(uint256 _entryID)
        external
        view
        returns (
            string,
            address,
            address,
            string,
            string,
            string
        )
    {
        uint256 entryIndex = database.getIndexByID(_entryID);
        return (
            entries[entryIndex].name,
            entries[entryIndex].gitcoin,
            entries[entryIndex].payouts,
            entries[entryIndex].github,
            entries[entryIndex].telegram,
            entries[entryIndex].keybase
        );
    }

    function updateEntry(
        uint256 _entryID,
        string  _name,
        address _gitcoin,
        address _payouts,
        string  _github,
        string  _telegram,
        string  _keybase
    )
        external
    {
        database.auth(_entryID, msg.sender);
        
        uint256 entryIndex = database.getIndexByID(_entryID);
            
        Entry memory m = (Entry(
        {
            name:       _name,
            gitcoin:    _gitcoin,
            payouts:    _payouts,
            github:     _github,
            telegram:   _telegram,
            keybase:    _keybase
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
