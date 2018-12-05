pragma solidity 0.4.25;

import "../common/ISchema.sol";
import "../common/IDatabase.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/introspection/SupportsInterfaceWithLookup.sol";


contract PortsSchema is ISchema, Ownable, SupportsInterfaceWithLookup {

    bytes4 constant internal INTERFACE_SCHEMA_ID = 0x153366ed;

    struct Entry {
        string  portName;
        uint16  portNumber;
        string  service;
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
            portName:   "",
            portNumber: uint16(0),
            service:    ""
        }));

        entries.push(m);
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
        uint256 entryIndex = database.getIndexByID(_entryID);
        return (
            entries[entryIndex].portName,
            entries[entryIndex].portNumber,
            entries[entryIndex].service
        );
    }

    function updateEntry(
        uint256 _entryID,
        string  _portName,
        uint16  _portNumber,
        string  _service
    )
        external
    {
        database.auth(_entryID, msg.sender);

        uint256 entryIndex = database.getIndexByID(_entryID);

        Entry memory m = (Entry(
        {
            portName:   _portName,
            portNumber: _portNumber,
            service:    _service
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
