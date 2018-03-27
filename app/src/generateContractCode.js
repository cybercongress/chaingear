
const generateContractCode = (name, fields) => {

  const structBodyStr = fields.map(f => `${f.type} ${f.name};`).join('\n');

  const createArgsStr = fields.map(f => `${f.type} _${f.name}`).join(', ');
  const createItemStr = fields.map(f => `${f.name}: _${f.name}`).join(',\n');
  return `
contract ${name} {
  struct ${name}Item {
    ${structBodyStr}
  }

  ${name}Item[] public entries;
  event EntryCreated(address owner, uint entryId);
    event EntryDeleted(uint entryId);

  function createEntry(${createArgsStr}) external {

        entries.push(${name}Item(
        {
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
