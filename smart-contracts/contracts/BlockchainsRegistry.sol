pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "./common/SplitPaymentChangeable.sol";


contract BlockchainRegistry is Destructible, SplitPaymentChangeable {

    struct BlockchainEntry {
        address owner;
        uint creationTime;
        uint lastUpdateTime;
        string blockchainName;
        string consensusType;
        string consensusAlgorithm;
        string tokenName;
        string ipfsHash;
    }

    enum PermissionType {OnlyOwner, AllUsers}

    string public name;
    string public description;
    string public tags;
    PermissionType public permissionType;
    uint public entryCreationFee;
    BlockchainEntry[] public entries;

    event EntryCreated(address owner, uint entryId);
    event EntryDeleted(uint entryId);
    event EntryUpdated(uint entryId, address owner, string name, string ticker);

    function BlockchainRegistry(
        address[] _benefitiaries,
        uint256[] _shares,
        PermissionType _permissionType,
        uint _entryCreationFee
    ) SplitPaymentChangeable(_benefitiaries, _shares) public
    {
        permissionType = _permissionType;
        entryCreationFee = _entryCreationFee;
    }

    function createEntry(string _blockchainName, string _consensusType, string _consensusAlgorithm, string _tokenName, string _ipfsHash) external payable {
        require(msg.sender == owner || msg.value == entryCreationFee);
        require(msg.sender == owner || permissionType == PermissionType.AllUsers);

        entries.push(BlockchainEntry(
        {
            owner: msg.sender,
            creationTime: now,
            lastUpdateTime: now,
            blockchainName: _blockchainName,
            consensusType: _consensusType,
            consensusAlgorithm: _consensusAlgorithm,
            tokenName: _tokenName,
            ipfsHash: _ipfsHash
        }));

        EntryCreated(msg.sender, entries.length - 1);
    }

      function updateEntryBlockchainName(uint _entryId, string _blockchainName) external {
      require(entries[_entryId].owner == msg.sender);

      entries[_entryId].lastUpdateTime = now;
      entries[_entryId].blockchainName = _blockchainName;

      EntryUpdated(_entryId, entries[_entryId].owner, entries[_entryId].blockchainName, _blockchainName);
    }

    function updateEntryConsensusType(uint _entryId, string _consensusType) external {
      require(entries[_entryId].owner == msg.sender);

      entries[_entryId].lastUpdateTime = now;
      entries[_entryId].consensusType = _consensusType;

      EntryUpdated(_entryId, entries[_entryId].owner, entries[_entryId].blockchainName, _consensusType);
    }

    function updateEntryConsensusAlgorithm(uint _entryId, string _consensusAlgorithm) external {
      require(entries[_entryId].owner == msg.sender);

      entries[_entryId].lastUpdateTime = now;
      entries[_entryId].consensusAlgorithm = _consensusAlgorithm;

      EntryUpdated(_entryId, entries[_entryId].owner, entries[_entryId].blockchainName, _consensusAlgorithm);
    }

    function updateEntryTokenName(uint _entryId, string _tokenName) external {
      require(entries[_entryId].owner == msg.sender);

      entries[_entryId].lastUpdateTime = now;
      entries[_entryId].tokenName = _tokenName;

      EntryUpdated(_entryId, entries[_entryId].owner, entries[_entryId].blockchainName, _tokenName);
    }

    function updateEntryIpfsHash(uint _entryId, string _ipfsHash) external {
      require(entries[_entryId].owner == msg.sender);

      entries[_entryId].lastUpdateTime = now;
      entries[_entryId].ipfsHash = _ipfsHash;

      EntryUpdated(_entryId, entries[_entryId].owner, entries[_entryId].blockchainName, _ipfsHash);
    }

    function deleteEntry(uint _entryId) external {
        require(entries[_entryId].owner == msg.sender);

        delete entries[_entryId];

        EntryDeleted(_entryId);
    }

    function isDeleted(uint _entryId) external constant returns (bool) {
        return entries[_entryId].owner == 0x0;
    }

    function entriesCount() external constant returns (uint) {
        return entries.length;
    }

    function setEntryCreationFee(uint _fee) external onlyOwner {
        entryCreationFee = _fee;
    }

    function setPermissionType(PermissionType _permissionType) external onlyOwner {
        permissionType = _permissionType;
    }

    function setName(string _name) external onlyOwner {
        uint len = bytes(_name).length;
        require(len > 0 && len <= 32);

        name = _name;
    }

    function setDescription(string _description) external onlyOwner {
        uint len = bytes(_description).length;
        require(len <= 256);

        description = _description;
    }

    function setTags(string _tags) external onlyOwner {
        uint len = bytes(_tags).length;
        require(len <= 64);

        tags = _tags;
    }
}
