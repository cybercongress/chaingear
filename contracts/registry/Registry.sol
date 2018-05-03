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
        registryName_ = _name;
        permissionTypeEntries_ = PermissionTypeEntries.OnlyAdmin;
        entryCreationFee_ = 0;
        registrySafe_ = new RegistrySafe();
        registryInitialized_ = false;
    }

    function initializeRegistry(string _linkToABIOfEntriesContract, bytes _entryCore)
        public
        onlyRegistryAdmin
        returns (address deployedAddress)
    {
        assembly {
            let s := mload(_entryCore)
            let p := add(_entryCore, 0x20)
            deployedAddress := create(0, p, s)
        }
        assert(deployedAddress != 0x0);
        registryInitialized_ = true;
        linkToABIOfEntriesContract_ = _linkToABIOfEntriesContract;
        
        entryBase_ = deployedAddress;
        
        return deployedAddress;
    }

    function createEntry()
        external
        whenNotPaused
        registryInitialized
        onlyPermissionedToEntries
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

    function transferTokenizedOnwerhip(address _newOwner)
        public
        whenNotPaused
        registryInitialized
        onlyOwner
    {
        registryAdmin = _newOwner;
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
