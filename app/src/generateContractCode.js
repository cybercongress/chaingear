
const generateContractCode = (name, fields) => {

  const structBodyStr = fields.map(f => `${f.type} ${f.name};`).join('\n');

      // PermissionType _permissionType,
      // uint _entryCreationFee,
      // string _name,
      // string _description,
      // string _tags

  const createArgsStr = fields.map(f => `${f.type} _${f.name}`).join(', ');
  const createItemStr = fields.map(f => `${f.name}: _${f.name}`).join(',\n');
  return `
contract ${name} {
  struct ${name}Item {
    ${structBodyStr}

    address owner;
    uint lastUpdateTime;
  }

  enum PermissionType {OnlyOwner, AllUsers, Whitelist}

  ${name}Item[] public entries;
  event EntryCreated(address owner, uint entryId);
  event EntryDeleted(uint entryId);


  function ${name}(
      address[] _benefitiaries,
      uint256[] _shares,
      PermissionType _permissionType,
      uint _entryCreationFee,
      string _name,
      string _description,
      string _tags
  ) public {

  }

  function createEntry(${createArgsStr}) external {

        entries.push(${name}Item(
        {
            owner: msg.sender,
            lastUpdateTime: now,
            ${createItemStr}
        }));
    
        EntryCreated(msg.sender, entries.length - 1);
  }

  function deleteEntry(uint index) external {
        for (uint i = index; i<entries.length-1; i++){
            entries[i] = entries[i+1];
        }
        delete entries[entries.length-1];
        entries.length--;

        EntryDeleted(index);
    }
  

    function entriesCount() constant public returns (uint) {
        return entries.length;
    }

}
  `
} 

module.exports = generateContractCode;
