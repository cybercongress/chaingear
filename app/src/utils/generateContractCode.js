
const generateContractCode = (name, fields) => {

  const structBodyStr = fields.map(f => `${f.type} ${f.name};`).join('\n');

  const createArgsStr = fields.map(f => `${f.type} _${f.name}`).join(', ');
  // const createItemStr = fields.map(f => `${f.name}: _${f.name}`).join(',\n');

  const generateGetor = (name, type) => {
    return `

    function ${name}Of(uint256 _entryId)
        public
        view
        returns (${type})
    {
        return entries[_entryId].${name};
    }
    
    `;
  }

  const empty = (type) => {
    if (type === 'address') return 'address(0)';
    if (type === 'uint256') return 'uint256(0)';
    if (type === 'int256') return 'int256(0)';
    if (type === 'bool') return 'true';

    if (type === 'uint') return 'uint(0)';
    if (type === 'int') return 'int(0)';
    if (type === 'string') return '""';



    return '""';
  }

// is EntryBasic, Ownable

  return `

import 'EntryBasic.sol';

contract ${name} is EntryBasic, Ownable {


    struct ${name}Entry {
        ${structBodyStr}

    }

    ${name}Entry[] public entries;


    function createEntry()
        public
        onlyOwner
        returns (
            uint256
        )
    {
        ${name}Entry memory entry = (${name}Entry(
        {

            ${fields.map(({ name, type }) => `${name}: ${empty(type)} `).join(',')} 
        }));

        uint256 newEntryID = entries.push(entry) - 1;

        return newEntryID;
    }


    function updateEntry(
        uint256 _entryID, 
        ${createArgsStr}
    )
        public
    {
        bool status = owner.call(bytes4(keccak256("checkAuth(uint256, address)")), _entryID, msg.sender);
        require(status == true);
        
        ${fields.map(f => `entries[_entryID].${f.name}= _${f.name};`).join('\n')}
        
        require(owner.call(bytes4(keccak256("updateEntryTimestamp(uint256)")), _entryID));
    }


    function deleteEntry(
        uint256 _entryIndex
    )
        public
        onlyOwner
    {
        uint256 lastEntryIndex = entries.length - 1;
        ${name}Entry storage lastEntry = entries[lastEntryIndex];

        entries[_entryIndex] = lastEntry;
        delete entries[lastEntryIndex];
        entries.length--;
    }


    function entriesAmount()
        public
        view
        returns (
            uint256 entryID
        )
    {
        return entries.length;
    }

    ${fields.map(({ name, type }) => generateGetor(name, type)).join(' \n ')}


    function entryInfo(uint256 _entryId)
        public
        view
        returns (${fields.map(({ name, type }) => type).join(', ')})
    {
        return (
            ${fields.map(({ name, type }) => `${name}Of(_entryId)`).join(',\n')}
        );
    }

}

`;

//   return `

// import 'Chaingeareable.sol';

// contract ${name} is Chaingeareable {
//   struct ${name}Item {
//     ${structBodyStr}

//     address owner;
//     uint lastUpdateTime;
//   }

//   ${name}Item[] public entries;
//   event EntryCreated(address owner, uint entryId);
//   event EntryDeleted(uint entryId);

//   struct Tokens {
//     address a;
//     uint count;
//   }


//   function ${name}(
//       address[] _benefitiaries,
//       uint256[] _shares,
//       Tokens[] tokens,
//       PermissionType _permissionType,
//       uint _entryCreationFee,
//       string _name,
//       string _description,
//       string _tags
//   ) Chaingeareable(_benefitiaries, _shares, _permissionType, _entryCreationFee, _name, _description, _tags) public {

//   }

//   function createEntry(${createArgsStr}) external payable {
//         require(msg.sender == owner || msg.value == entryCreationFee);
//         require(msg.sender == owner || permissionType == PermissionType.AllUsers);
        
//         entries.push(${name}Item(
//         {
//             owner: msg.sender,
//             lastUpdateTime: now ${fields.length > 0 ? ',' : ''}
//             ${createItemStr}
//         }));
    
//         EntryCreated(msg.sender, entries.length - 1);
//   }

//   function deleteEntry(uint index) external {
//         for (uint i = index; i<entries.length-1; i++){
//             entries[i] = entries[i+1];
//         }
//         delete entries[entries.length-1];
//         entries.length--;

//         EntryDeleted(index);
//     }
  

//     function entriesCount() constant public returns (uint) {
//         return entries.length;
//     }

// }
//   `
} 

module.exports = generateContractCode;
