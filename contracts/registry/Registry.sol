pragma solidity 0.4.23;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../common/SplitPaymentChangeable.sol";
import "./Chaingeareable.sol";
import "../common/EntryBasic.sol";
import "../common/RegistryBasic.sol";
import "../common/RegistrySafe.sol";


contract Registry is RegistryBasic, Chaingeareable, ERC721Token, SplitPaymentChangeable {

    using SafeMath for uint256;
    
    // TODO change to inner ERC721 modifier
    modifier onlyEntryOwner(uint256 _entryID) {
        require(ownerOf(_entryID) == msg.sender);
        _;
    }

    constructor(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol
    )
        SplitPaymentChangeable(_benefitiaries, _shares)
        ERC721Token(_name, _symbol)
        public
        payable
    {
        createEntryPermissionGroup_ = CreateEntryPermissionGroup.OnlyAdmin;
        registryName_ = _name;
        entryCreationFee_ = 0;
        registrySafe_ = new RegistrySafe();
        registryInitialized_ = false;
    }

    function initializeRegistry(
        string _linkToABIOfEntriesContract,
        bytes _entryCore
    )
        public
        onlyAdmin
        returns (
            address entryBase
        )
    {
        address deployedAddress;
        assembly {
            let s := mload(_entryCore)
            let p := add(_entryCore, 0x20)
            deployedAddress := create(0, p, s)
        }

        assert(deployedAddress != 0x0);
        entryBase_ = deployedAddress;
        registryInitialized_ = true;
        linkToABIOfEntriesContract_ = _linkToABIOfEntriesContract;
        
        return entryBase_;
    }

    function createEntry()
        external
        whenNotPaused
        registryInitialized
        onlyPermissionedToCreateEntries
        payable
        returns (uint256)
    {
        require(msg.value == entryCreationFee_);
        // TODO check for uniqueness for fields (+protected by uniq field gen)

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
        registryInitialized
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
        registryInitialized
        payable
    {
        EntryBasic(entryBase_).updateEntryFund(_entryId, msg.value);
        registrySafe_.transfer(msg.value);

        emit EntryFunded(_entryId, msg.sender);
    }

    function claimEntryFunds(uint256 _entryId, uint _amount)
        public
        whenNotPaused
        registryInitialized
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
