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

contract NodesSchema is IEntry, Ownable, SupportsInterfaceWithLookup {
    
    using SafeMath for uint256;
    
    bytes4 internal constant InterfaceId_EntryCore = 0xd4b1117d;

    struct Entry {
        string  name;
        string  addressNode;
        string  services;
        string  description;
        string  operating;
    }
    
    mapping(string => bool) internal nameUniqIndex;
    
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
            name:           "",
            addressNode:    "",
            services:       "",
            description:    "",
            operating:      ""
    
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
            string,
            string,
            string,
            string
        )
    {
        uint256 entryIndex = IRegistrySchema(owner).getIndexByID(_entryID);
        return (
            entries[entryIndex].name,
            entries[entryIndex].addressNode,
            entries[entryIndex].services,
            entries[entryIndex].description,
            entries[entryIndex].operating
        );
    }

    // Example: you can write methods for earch parameter and update them separetly
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
        IRegistrySchema(owner).checkEntryOwnership(_entryID, msg.sender);
        
        //before we check that value already exist, then set than name used and unset previous value
        require(nameUniqIndex[_name] == false);
        nameUniqIndex[_name] = true;
        
        uint256 entryIndex = IRegistrySchema(owner).getIndexByID(_entryID);
        
        string storage lastName = entries[entryIndex].name;
        nameUniqIndex[lastName] = false;
            
        Entry memory m = (Entry(
        {
            name:           _name,
            addressNode:    _addressNode,
            services:       _services,
            description:    _description,
            operating:      _operating
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
        
        string storage nameToClear = entries[entryIndex].name;
        nameUniqIndex[nameToClear] = false;
        
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
