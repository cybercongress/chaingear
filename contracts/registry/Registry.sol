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
    
    struct EntryMeta {
        address owner;
        address creator;
        uint createdAt;
        uint lastUpdateTime;
        uint currentEntryBalanceETH;
        uint accumulatedOverallEntryETH;
    }
    
    EntryMeta[] internal entriesMeta;

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

    /**
    * @dev entry creation
    * @return uint256
    */
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
        
        /* entriesMeta[_entryID].creator = msg.sender; */
        
        uint256 newEntryId = EntryBasic(entryBase_).createEntry();
        _mint(msg.sender, newEntryId);
        
        EntryMeta memory meta = (EntryMeta(
        {
            lastUpdateTime: block.timestamp,
            createdAt: block.timestamp,
            owner: tx.origin,
            creator: tx.origin,
            currentEntryBalanceETH: 0,
            accumulatedOverallEntryETH: 0
        }));
        
        entriesMeta.push(meta);

        emit EntryCreated(msg.sender, newEntryId);

        return newEntryId;
    }

    //todo remove in favor of Adminable.changeAdmin()?
    /**
    * @dev delegate tokenized ownership to new admin
    * @param _newOwner address 
    */
    function transferTokenizedOnwerhip(address _newOwner)
        public
        whenNotPaused
        onlyOwner
    {
        admin_ = _newOwner;
    }

    /**
    * @dev remove entry from the Regisrty
    * @param _entryID uint256
    */
    function deleteEntry(uint256 _entryID)
        external
        whenNotPaused
        onlyOwnerOf(_entryID)
    {
        uint256 entryIndex = allTokensIndex[_entryID];
        EntryBasic(entryBase_).deleteEntry(entryIndex);
        super._burn(msg.sender, _entryID);
        
        uint256 lastEntryIndex = entriesMeta.length.sub(1);
        EntryMeta storage lastEntry = entriesMeta[lastEntryIndex];

        entriesMeta[_entryID] = lastEntry;
        delete entriesMeta[lastEntryIndex];
        entriesMeta.length--;

        emit EntryDeleted(msg.sender, _entryID);
    }

    /**
    * @dev delegate entry tokenized ownership to new owner
    * @param _entryID uint256
    * @param _newOwner address
    */
    function transferEntryOwnership(
        uint _entryID, 
        address _newOwner
    )
        public
        whenNotPaused
        registryInitialized
        onlyOwnerOf(_entryID)
    {
        entriesMeta[_entryID].owner = _newOwner;

        super.removeTokenFrom(msg.sender, _entryID);
        super.addTokenTo(_newOwner, _entryID);

        emit EntryChangedOwner(_entryID, _newOwner);
    }

    /**
    * @dev entry fund setter
    * @param _entryID uint256
    */
    function fundEntry(uint256 _entryID)
        public
        whenNotPaused
        registryInitialized
        payable
    {
        entriesMeta[_entryID].currentEntryBalanceETH = entriesMeta[_entryID].currentEntryBalanceETH.add(msg.value);
        entriesMeta[_entryID].accumulatedOverallEntryETH = entriesMeta[_entryID].accumulatedOverallEntryETH.add(msg.value);
        registrySafe_.transfer(msg.value);

        emit EntryFunded(_entryID, msg.sender);
    }

    /**
    * @dev entry fund claimer
    * @param _entryID uint256
    * @param _amount uint
    */
    function claimEntryFunds(
        uint256 _entryID, 
        uint _amount
    )
        public
        whenNotPaused
        registryInitialized
        onlyOwnerOf(_entryID)
    {
        require(_amount <= entriesMeta[_entryID].currentEntryBalanceETH);
        entriesMeta[_entryID].currentEntryBalanceETH = entriesMeta[_entryID].currentEntryBalanceETH.sub(_amount);
        RegistrySafe(registrySafe_).claim(msg.sender, _amount);

        emit EntryFundsClaimed(_entryID, msg.sender, _amount);
    }

    /**
    * @dev safe balance getter
    * @return uint
    */
    function safeBalance()
        public
        view
        returns (uint balance)
    {
        return address(registrySafe_).balance;
    }
    
    function entryMeta(uint256 _entryID) 
        public 
        view 
        returns (
            address,
            address, 
            uint, 
            uint, 
            uint, 
            uint
        )
    {
        return (
            entriesMeta[_entryID].owner,
            entriesMeta[_entryID].creator,
            entriesMeta[_entryID].createdAt,
            entriesMeta[_entryID].lastUpdateTime,
            entriesMeta[_entryID].currentEntryBalanceETH,
            entriesMeta[_entryID].accumulatedOverallEntryETH
        );
    }
    
    function updateEntry(uint256 _entryID) 
        external
    {
        require(entryBase_ == msg.sender);
        require(entriesMeta[_entryID].owner == tx.origin);
        entriesMeta[_entryID].lastUpdateTime = block.timestamp;
    }

}
