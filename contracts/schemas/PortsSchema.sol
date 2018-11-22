pragma solidity 0.4.25;

import "../common/IEntry.sol";
import "../common/IConnector.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/introspection/SupportsInterfaceWithLookup.sol";

contract PortsSchema is IEntry, Ownable, SupportsInterfaceWithLookup {

    using SafeMath for uint256;

    bytes4 internal constant InterfaceId_EntryCore = 0xd4b1117d;

    struct Entry {
        string  portName;
        uint16  portNumber;
        string  service;
    }

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
        uint256 entryIndex = registry.getIndexByID(_entryID);
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
        registry.auth(_entryID, msg.sender);

        uint256 entryIndex = registry.getIndexByID(_entryID);

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
        require(entries.length > uint256(0));

        uint256 lastEntryIndex = entries.length.sub(1);
        Entry memory lastEntry = entries[lastEntryIndex];

        entries[_entryIndex] = lastEntry;
        delete entries[lastEntryIndex];
        entries.length--;
    }

}
