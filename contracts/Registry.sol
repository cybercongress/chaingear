pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/AddressUtils.sol";
import "./common/Chaingeareable.sol";


contract Registry is Chaingeareable, ERC721Token {

    using SafeMath for uint256;
    using AddressUtils for address;

    struct Entry {
        uint price;
    }
    Entry[] public entries;

    /* struct EntryMeta {
       address creator;
       uint createdAt;
       uint lastUpdateTime;
       uint currentEntryBalanceETH;
       uint accumulatedOverallEntryEth;
    }

    EntryMeta[] entriesMeta;
    mapping (uint256 => EntryMeta) entriesMetaIndex; */

    event EntryCreated(address entryCreator, uint256 entryId);
    event EntryUpdated(address entryOwner, uint256 entryId);
    event EntryDeleted(address entryOwner, uint256 entryId);

    function Registry(
        address[] _benefitiaries,
        uint256[] _shares,
        PermissionTypeEntries _permissionTypeEntries,
        uint _entryCreationFee,
        string _linkABI,
        string _linkMeta,
        string _linkSourceCode,
        string _registryName,
        string _registryDescription,
        string _registySymbol
    ) SplitPaymentChangeable(_benefitiaries, _shares)
      ERC721Token(_registryName, _registySymbol) public 
    {
        permissionTypeEntries_ = _permissionTypeEntries;
        entryCreationFee_ = _entryCreationFee;
        linkABI_ = _linkABI;
        linkMeta_ = _linkMeta;
        linkSourceCode_ = _linkSourceCode;
        registryName_ = _registryName;
        registryDescription_ = _registryDescription;

        registerInChaingear();
    }

    function createEntry(uint _price) external onlyPermissionedToEntries payable whenNotPaused returns (uint256 tokenId) {
        require(msg.value == entryCreationFee_);

        Entry memory entry = (Entry(
        {
            price: _price
        }));
        uint256 newEntryId = entries.push(entry) - 1;
        ERC721Token._mint(msg.sender, newEntryId);

        EntryCreated(msg.sender, newEntryId);
        return newEntryId;
    }

    function updateEntryPrice(uint256 _entryId, uint _price) external {
        require (ERC721BasicToken.ownerOf(_entryId) == msg.sender);

        entries[_entryId].price = _price;

        EntryUpdated(msg.sender, _entryId);
    }

    function deleteEntry(uint256 _entryId) whenNotPaused external {
        require (ERC721BasicToken.ownerOf(_entryId) == msg.sender);

        uint256 entryIndex = allTokensIndex[_entryId];
        uint256 lastEntryIndex = entries.length.sub(1);
        Entry storage lastEntry = entries[lastEntryIndex];

        entries[entryIndex] = lastEntry;
        delete entries[lastEntryIndex];
        entries.length--;

        ERC721Token._burn(msg.sender, _entryId);

        //rethink this event
        EntryDeleted(msg.sender, _entryId);
    }

    function getEntry(uint256 _entryId) external view returns (uint price) {
        return (entries[_entryId].price);
    }
}
