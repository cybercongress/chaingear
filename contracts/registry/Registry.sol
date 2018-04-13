pragma solidity ^0.4.18;

import "./Chaingeareable.sol";
import "./EntryBase.sol";
import "../common/SplitPaymentChangeable.sol";
import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/AddressUtils.sol";
import "../common/RegistrySafe.sol";

contract Registry is EntryBase, Chaingeareable, ERC721Token, SplitPaymentChangeable {

    using SafeMath for uint256;
    using AddressUtils for address;

    function Registry(
        address[] _benefitiaries,
        uint256[] _shares,
        PermissionTypeEntries _permissionType,
        uint _entryCreationFee,
        string _name,
        string _symbol,
        string _description,
        string _linkABI
    )
        SplitPaymentChangeable(_benefitiaries, _shares)
        ERC721Token(_name, _symbol)
        public
        payable
    {
        permissionTypeEntries_ = _permissionType;
        linkABI_ = _linkABI;
        entryCreationFee_ = _entryCreationFee;
        registryName_ = _name;
        registryDescription_ = _description;
        registrySafe_ = new RegistrySafe();
    }

    function createEntry(address _expensiveAddress, uint _expensiveUint, int _expensiveInt, string _expensiveString)
        external
        payable
        whenNotPaused
        onlyPermissionedToEntries
        returns (uint256)
    {
        require(msg.value == entryCreationFee_);

        Entry memory entry = (Entry(
        {
            owner: msg.sender,
            expensiveAddress: _expensiveAddress,
            expensiveUint: _expensiveUint,
            expensiveInt: _expensiveInt,
            expensiveString: _expensiveString,
            lastUpdateTime: now
        }));

        uint256 newEntryId = entries.push(entry) - 1;
        super._mint(msg.sender, newEntryId);

        EntryCreated(msg.sender, newEntryId);

        return newEntryId;
    }

    function deleteEntry(uint256 _entryId)
        whenNotPaused
        external
    {
        require (ERC721BasicToken.ownerOf(_entryId) == msg.sender);

        uint256 entryIndex = allTokensIndex[_entryId];
        uint256 lastEntryIndex = entries.length.sub(1);
        Entry storage lastEntry = entries[lastEntryIndex];

        entries[entryIndex] = lastEntry;
        delete entries[lastEntryIndex];
        entries.length--;

        super._burn(msg.sender, _entryId);

        EntryDeleted(msg.sender, _entryId);
    }


    function transferEntryOwnership(uint _entryId, address _newOwner)
        whenNotPaused
        external
    {
        require (ERC721BasicToken.ownerOf(_entryId) == msg.sender);

        super.removeTokenFrom(msg.sender, _entryId);
        super.addTokenTo(_newOwner, _entryId);

        EntryChangedOwner(_entryId, _newOwner);
    }

}
