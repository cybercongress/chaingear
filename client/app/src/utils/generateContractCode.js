
const generateContractCode = (name, fields) => {

  const structBodyStr = fields.map(f => `${f.type} ${f.name};`).join('\n');

  const createArgsStr = fields.map(f => `${f.type} _${f.name}`).join(', ');
    // const createItemStr = fields.map(f => `${f.name}: _${f.name}`).join(',\n');

  const empty = (type) => {
    if (type === 'string') return '""';
    if (type === 'address') return 'address(0)';
    if (type === 'bool') return 'false';
    if (type === 'uint256') return 'uint256(0)';
    if (type === 'int256') return 'int256(0)';

    return '""';
  }

//TODO Entry[] public entries move to internal, change source in ABI for extracting fields;

  return `

import './Dependencies.sol';


contract Schema is IEntry, Ownable, SupportsInterfaceWithLookup {

    using SafeMath for uint256;
    
    bytes4 internal constant InterfaceId_EntryCore = 0xd4b1117d;
    /**
     * 0xd4b1117d ===
     *   bytes4(keccak256('createEntry(uint256)')) ^
     *   bytes4(keccak256('deleteEntry(uint256)')) ^
     *   bytes4(keccak256('getEntriesAmount()')) ^
     *   bytes4(keccak256('getEntriesIDs()'))
     */

    struct Entry {
        ${structBodyStr}

    }

    Entry[] public entries;
    
    IConnector internal registry;
    
    event EntryUpdated(
        uint256 _entryID,
        ${createArgsStr}
    );
    
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
            ${fields.map(({ name, type }) => `${name}: ${empty(type)}`).join(',\n')} 
        }));
        entries.push(m);
    }
    
    
    function readEntry(uint256 _entryID)
        external
        view
        returns (${fields.map(({ name, type }) => type).join(', ')})
    {
        uint256 entryIndex = registry.getIndexByID(_entryID);
        return (
            ${fields.map(({ name, type }) => `entries[entryIndex].${name}`).join(',\n')}
        );
    }


    function updateEntry(
        uint256 _entryID, 
        ${createArgsStr}
    )
        external
    {
        registry.auth(_entryID, msg.sender);
        
        uint256 entryIndex = registry.getIndexByID(_entryID);
        
        Entry memory m = (Entry(
        {
            ${fields.map(f => `${f.name}: _${f.name}`).join(',\n')}
        }));    
        entries[entryIndex] = m;
        
        emit EntryUpdated(_entryID, ${fields.map(field => `_${field.name}`).join(', ')});
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

`;
}

module.exports = generateContractCode;
