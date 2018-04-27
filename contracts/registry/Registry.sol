pragma solidity 0.4.19;

import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "../common/SplitPaymentChangeable.sol";
import "../common/RegistrySafe.sol";
import "../common/RegistryBasic.sol";
import "../common/EntryBasic.sol";
import "./Chaingeareable.sol";


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

        entryBasic_ = deployedAddress;
    }

    function createEntry()
        external
        whenNotPaused
        onlyPermissionedToEntries
        payable
        returns (uint256)
    {
        require(msg.value == entryCreationFee_);

        uint256 newEntryId = EntryBasic(entryBasic_).createEntry();
        _mint(msg.sender, newEntryId);

        EntryCreated(msg.sender, newEntryId);

        return newEntryId;
    }

    function transferTokenizedOnwerhip(address _newOwner)
        public
        whenNotPaused
        onlyOwner
    {
        registryAdmin_ = _newOwner;
    }

    function deleteEntry(uint256 _entryId)
        external
        whenNotPaused
        onlyEntryOwner(_entryId)
    {
        uint256 entryIndex = allTokensIndex[_entryId];
        EntryBasic(entryBasic_).deleteEntry(entryIndex);
        super._burn(msg.sender, _entryId);

        EntryDeleted(msg.sender, _entryId);
    }

    function transferEntryOwnership(uint256 _entryId, address _newOwner)
        public
        whenNotPaused
        onlyEntryOwner(_entryId)
    {
        EntryBasic(entryBasic_).updateEntryOwnership(_entryId, _newOwner);

        super.removeTokenFrom(msg.sender, _entryId);
        super.addTokenTo(_newOwner, _entryId);

        EntryChangedOwner(_entryId, _newOwner);
    }

    function fundEntry(uint256 _entryId)
        public
        whenNotPaused
        payable
    {
        EntryBasic(entryBasic_).updateEntryFund(_entryId, msg.value);
        registrySafe_.transfer(msg.value);

        EntryFunded(_entryId, msg.sender);
    }

    function claimEntryFunds(uint256 _entryId, uint _amount)
        public
        whenNotPaused
        onlyEntryOwner(_entryId)
    {
        require(_amount <= EntryBasic(entryBasic_).currentEntryBalanceETHOf(_entryId));
        EntryBasic(entryBasic_).claimEntryFund(_entryId, _amount);
        RegistrySafe(registrySafe_).claim(msg.sender, _amount);

        EntryFundsClaimed(_entryId, msg.sender, _amount);
    }
    
    function safeBalance()
        public
        view
        returns (uint balance)
    {
        return RegistrySafe(registrySafe_).balance;
    }
}
