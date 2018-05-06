pragma solidity 0.4.21;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../common/SplitPaymentChangeable.sol";
import "./Chaingeareable.sol";
import "../common/EntryBasic.sol";
import "../common/RegistryBasic.sol";
import "../common/RegistrySafe.sol";


contract Registry is RegistryBasic, Chaingeareable, ERC721Token, SplitPaymentChangeable {

    using SafeMath for uint256;

    modifier onlyEntryOwner(uint256 _entryID) {
        require(ownerOf(_entryID) == msg.sender);
        _;
    }

    function Registry(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol,
        string _linkToABIOfEntriesContract,
        bytes _bytecodeOfEntriesContract
    )
        SplitPaymentChangeable(_benefitiaries, _shares)
        ERC721Token(_name, _symbol)
        public
        payable
    {
        permissionTypeEntries_ = PermissionTypeEntries.OnlyAdmin;
        registryName_ = _name;
        linkToABIOfEntriesContract_ = _linkToABIOfEntriesContract;
        registrySafe_ = new RegistrySafe();

        address deployedAddress;
        assembly {
            let s := mload(_bytecodeOfEntriesContract)
            let p := add(_bytecodeOfEntriesContract, 0x20)
            deployedAddress := create(0, p, s)
        }

        assert(deployedAddress != 0x0);

        entryCreationFee_ = 0;

        entryBase_ = deployedAddress;
    }

    function createEntry()
        external
        whenNotPaused
        onlyPermissionedToEntries
        payable
        returns (uint256)
    {
        require(msg.value == entryCreationFee_);

        uint256 newEntryId = EntryBasic(entryBase_).createEntry();
        _mint(msg.sender, newEntryId);

        emit EntryCreated(msg.sender, newEntryId);

        return newEntryId;
    }

    //todo remove in favor of Adminable.changeAdmin()?
    function transferTokenizedOnwerhip(address _newOwner)
        public
        whenNotPaused
        onlyOwner
    {
        admin_ = _newOwner;
    }

    function deleteEntry(uint256 _entryId)
        external
        whenNotPaused
        onlyEntryOwner(_entryId)
    {
        uint256 entryIndex = allTokensIndex[_entryId];
        EntryBasic(entryBase_).deleteEntry(entryIndex);
        super._burn(msg.sender, _entryId);

        emit EntryDeleted(msg.sender, _entryId);
    }

    function transferEntryOwnership(uint256 _entryId, address _newOwner)
        public
        whenNotPaused
        onlyEntryOwner(_entryId)
    {
        EntryBasic(entryBase_).updateEntryOwnership(_entryId, _newOwner);

        super.removeTokenFrom(msg.sender, _entryId);
        super.addTokenTo(_newOwner, _entryId);

        emit EntryChangedOwner(_entryId, _newOwner);
    }

    function fundEntry(uint256 _entryId)
        public
        whenNotPaused
        payable
    {
        EntryBasic(entryBase_).updateEntryFund(_entryId, msg.value);
        registrySafe_.transfer(msg.value);

        emit EntryFunded(_entryId, msg.sender);
    }

    function claimEntryFunds(uint256 _entryId, uint _amount)
        public
        whenNotPaused
        onlyEntryOwner(_entryId)
    {
        require(_amount <= EntryBasic(entryBase_).currentEntryBalanceETHOf(_entryId));
        EntryBasic(entryBase_).claimEntryFund(_entryId, _amount);
        RegistrySafe(registrySafe_).claim(msg.sender, _amount);

        emit EntryFundsClaimed(_entryId, msg.sender, _amount);
    }

    function safeBalance()
        public
        view
        returns (uint balance)
    {
        return address(registrySafe_).balance;
    }
}
