pragma solidity 0.4.25;

import "../common/ISchema.sol";
import "../common/IDatabase.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/introspection/SupportsInterfaceWithLookup.sol";


contract TestSchema is ISchema, Ownable, SupportsInterfaceWithLookup {
    
    bytes4 private constant INTERFACE_SCHEMA_EULER_ID = 0x153366ed;

    struct Entry {
        string stringField;
        address addressField;
        uint256 uint256Field;
        int256 int256Field;
    }
    
    Entry[] public entries;
    
    mapping(string => bool) private stringFieldUniqIndex;
    mapping(address => bool) private addressFieldUniqIndex;
    mapping(uint256 => bool) private uint256FieldUniqIndex;
    mapping(int256 => bool) private int256FieldUniqIndex;
    
    IDatabase internal database;
    
    constructor()
        public
    {
        _registerInterface(INTERFACE_SCHEMA_EULER_ID);
        database = IDatabase(owner);
    }
    
    function() external {} 
    
    function createEntry()
        external
        onlyOwner
    {
        Entry memory m = (Entry(
        {
            stringField: "",
            addressField: address(0),
            uint256Field: uint256(0),
            int256Field: int256(0)
        }));

        entries.push(m);
    }
    
    function readEntry(uint256 _entryID)
        external
        view
        returns (
            string,
            address,
            uint256,
            int256
        )
    {
        uint256 entryIndex = database.getIndexByID(_entryID);
        return (
            entries[entryIndex].stringField,
            entries[entryIndex].addressField,
            entries[entryIndex].uint256Field,
            entries[entryIndex].int256Field
        );
    }

    function updateEntry(
        uint256 _entryID,
        string  _stringField,
        address _addressField,
        uint256 _uint256Field,
        int256  _int256Field
    )
        external
    {
        database.auth(_entryID, msg.sender);
        
        uint256 entryIndex = database.getIndexByID(_entryID);
        
        if (bytes(_stringField).length > 0) {
            require(stringFieldUniqIndex[_stringField] == false);
            stringFieldUniqIndex[_stringField] = true;
            stringFieldUniqIndex[entries[entryIndex].stringField] = false;
        }
        
        if (_addressField != address(0)) {
            require(addressFieldUniqIndex[_addressField] == false);
            addressFieldUniqIndex[_addressField] = true;
            addressFieldUniqIndex[entries[entryIndex].addressField] = false;
        }
        
        if (_uint256Field != uint256(0)) {
            require(uint256FieldUniqIndex[_uint256Field] == false);
            uint256FieldUniqIndex[_uint256Field] = true;
            uint256FieldUniqIndex[entries[entryIndex].uint256Field] = false;
        }
        
        if (_int256Field != int256(0)) {
            require(int256FieldUniqIndex[_int256Field] == false);
            int256FieldUniqIndex[_int256Field] = true;
            int256FieldUniqIndex[entries[entryIndex].int256Field] = false;
        }
            
        Entry memory m = (Entry(
        {
            stringField: _stringField,
            addressField: _addressField,
            uint256Field: _uint256Field,
            int256Field: _int256Field
        }));
        entries[entryIndex] = m;
    }

    function deleteEntry(uint256 _entryIndex)
        external
        onlyOwner
    {
        stringFieldUniqIndex[entries[_entryIndex].stringField] = false;
        addressFieldUniqIndex[entries[_entryIndex].addressField] = false;
        uint256FieldUniqIndex[entries[_entryIndex].uint256Field] = false;
        int256FieldUniqIndex[entries[_entryIndex].int256Field] = false;
        
        uint256 lastEntryIndex = entries.length - 1;
        Entry memory lastEntry = entries[lastEntryIndex];
        
        entries[_entryIndex] = lastEntry;
        delete entries[lastEntryIndex];
        entries.length--;
    }

}
