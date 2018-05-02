
const generateContractCode = (name, fields) => {

  const structBodyStr = fields.map(f => `${f.type} ${f.name};`).join('\n');

  const createArgsStr = fields.map(f => `${f.type} _${f.name}`).join(', ');
  const createItemStr = fields.map(f => `${f.name}: _${f.name}`).join(',\n');

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
    if (type === 'uint') return 'uint(0)';
    if (type === 'int') return 'int(0)';
    if (type === 'string') return '""';



    return '""';
  }

// is EntryBasic, Ownable

  return `

import 'EntryBasic.sol';

contract ${name} is EntryBasic, Ownable {

    using SafeMath for uint256;

    struct ${name}Entry {
        ${structBodyStr}

        EntryMeta metainformation;
    }

    ${name}Entry[] public entries;

    modifier onlyEntryOwner(uint256 _entryId) {
        require(entries[_entryId].metainformation.owner == msg.sender);
        _;
    }

    function entriesAmount()
        public
        view
        returns (uint256 entryID)
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

    function createEntry()
        public
        onlyOwner
        returns (uint256 entryId)
    {
        EntryMeta memory meta = (EntryMeta(
        {
            lastUpdateTime: block.timestamp,
            createdAt: block.timestamp,
            owner: tx.origin,
            creator: tx.origin,
            currentEntryBalanceETH: 0,
            accumulatedOverallEntryETH: 0
        }));

        ${name}Entry memory entry = (${name}Entry(
        {

            ${fields.map(({ name, type }) => `${name}: ${empty(type)}, `).join('')} 

            metainformation: meta
        }));

        uint256 newEntryId = entries.push(entry) - 1;

        return newEntryId;
    }

    function updateEntry(uint256 _entryId, ${createArgsStr})
        onlyEntryOwner(_entryId)
        public
    {

        ${fields.map(({ name, type }) => `entries[_entryId].${name} = _${name}`).join(';\n')};


        entries[_entryId].metainformation.lastUpdateTime = block.timestamp;
    }

    function deleteEntry(uint256 _entryIndex)
        onlyOwner
        public
    {
        uint256 lastEntryIndex = entries.length.sub(1);
        ${name}Entry storage lastEntry = entries[lastEntryIndex];

        entries[_entryIndex] = lastEntry;
        delete entries[lastEntryIndex];
        entries.length--;
    }

    function updateEntryOwnership(uint256 _entryID, address _newOwner)
        onlyOwner
        public
    {
        entries[_entryID].metainformation.owner = _newOwner;
    }

    function updateEntryFund(uint256 _entryID, uint256 _amount)
        onlyOwner
        public
    {
        entries[_entryID].metainformation.accumulatedOverallEntryETH.add(_amount);
    }

    function claimEntryFund(uint256 _entryID, uint256 _amount)
        onlyOwner
        public
    {
        entries[_entryID].metainformation.currentEntryBalanceETH.sub(_amount);
    }

    function entryOwnerOf(uint256 _entryID)
        public
        view
        returns (address)
    {
        entries[_entryID].metainformation.owner;
    }

    function creatorOf(uint256 _entryID)
        public
        view
        returns (address)
    {
        entries[_entryID].metainformation.creator;
    }

    function createdAtOf(uint256 _entryID)
        public
        view
        returns (uint)
    {
        entries[_entryID].metainformation.createdAt;
    }

    function lastUpdateTimeOf(uint256 _entryID)
        public
        view
        returns (uint)
    {
        return entries[_entryID].metainformation.lastUpdateTime;
    }

    function currentEntryBalanceETHOf(uint256 _entryID)
        public
        view
        returns (uint)
    {
        return entries[_entryID].metainformation.currentEntryBalanceETH;
    }

    function accumulatedOverallEntryETHOf(uint256 _entryID)
        public
        view
        returns (uint)
    {
        return entries[_entryID].metainformation.accumulatedOverallEntryETH;
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
