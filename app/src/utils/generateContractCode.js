
const generateContractCode = (name, fields) => {

  const structBodyStr = fields.map(f => `${f.type} ${f.name};`).join('\n');

  const createArgsStr = fields.map(f => `${f.type} _${f.name}`).join(', ');
  // const createItemStr = fields.map(f => `${f.name}: _${f.name}`).join(',\n');

  const generateGetor = (name, type) => {
    return `

    function ${name}FieldOf(uint256 _entryID)
        external
        view
        entryExists(_entryID)
        returns (${type})
    {
        uint256 entryIndex = allEntriesIndex[_entryID];
        
        return entries[entryIndex].${name};
    }
    
    `;
  }

  const empty = (type) => {
    if (type === 'string') return '""';
    if (type === 'address') return 'address(0)';
    if (type === 'bool') return 'false';
    if (type === 'uint256') return 'uint256(0)';
    if (type === 'int256') return 'int256(0)';

    return '""';
  }

// is EntryInterface, Ownable

  return `

import './Dependencies.sol';


contract ${name} is EntryInterface, Ownable, SupportsInterfaceWithLookup {

    using SafeMath for uint256;
    
    bytes4 internal constant InterfaceId_EntryCore = 0xcf3c2b48;
    /**
     * 0xcf3c2b48 ===
     *   bytes4(keccak256('createEntry(uint256)')) ^
     *   bytes4(keccak256('deleteEntry(uint256)')) ^
     *   bytes4(keccak256('entriesAmount()'))
     */

    struct ${name}Entry {
        ${structBodyStr}

    }

    ${name}Entry[] public entries;
    
    uint256[] internal allTokens;
    
    mapping(uint256 => uint256) internal allEntriesIndex;
    
    modifier entryExists(uint256 _entryID){
        if (_entryID != 0) {
            require(allEntriesIndex[_entryID] != 0);
        } else {
            require(allTokens[0] == 0);
        }
        _;
    }
    
    constructor()
        public
    {
        _registerInterface(InterfaceId_EntryCore);
    }
    
    function() external {}

    function createEntry(
        uint256 _entryID
    )
        external
        onlyOwner
    {
        ${name}Entry memory m = (${name}Entry(
        {
            ${fields.map(({ name, type }) => `${name}: ${empty(type)}`).join(',\n')} 
        }));

        entries.push(m);
        allEntriesIndex[_entryID] = allTokens.length;
        allTokens.push(_entryID);
    }
    
    
    function readEntry(
        uint256 _entryID
    )
        external
        view
        entryExists(_entryID)
        returns (${fields.map(({ name, type }) => type).join(', ')})
    {
        uint256 entryIndex = allEntriesIndex[_entryID];
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
        require(owner.call(bytes4(keccak256(
            "checkEntryOwnership(uint256, address)")),
            _entryID,
            msg.sender
        ));
        
        uint256 entryIndex = allEntriesIndex[_entryID];
        
        ${name}Entry memory m = (${name}Entry(
        {
            ${fields.map(f => `${f.name}: _${f.name}`).join(',\n')}
        }));
        
        entries[entryIndex] = m;
        
        require(owner.call(bytes4(keccak256(
            "updateEntryTimestamp(uint256)")),
            _entryID
        ));
    }


    function deleteEntry(
        uint256 _entryID
    )
        external
        onlyOwner
    {
        require(entries.length > 0);
        uint256 entryIndex = allEntriesIndex[_entryID];
        
        uint256 lastTokenIndex = allTokens.length.sub(1);
        
        uint256 lastToken = allTokens[lastTokenIndex];
        ${name}Entry memory lastEntry = entries[lastTokenIndex];
        
        allTokens[entryIndex] = lastToken;
        entries[entryIndex] = lastEntry;
        
        allTokens[lastTokenIndex] = 0;
        delete entries[lastTokenIndex];
        
        allTokens.length--;
        entries.length--;
        
        allEntriesIndex[_entryID] = 0;
        allEntriesIndex[lastTokenIndex] = entryIndex;
    }


    function getEntriesAmount()
        external
        view
        returns (
            uint256
        )
    {
        return entries.length;
    }
    
    function getEntriesIDs()
        external
        view
        returns (
            uint256[]
        )
    {
        return allTokens;
    }

}

`;
} 

module.exports = generateContractCode;
