pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../common/SplitPaymentChangeable.sol";
import "./Chaingeareable.sol";
import "../common/EntryBasic.sol";
import "../common/RegistryBasic.sol";
import "../common/Safe.sol";


contract Registry is RegistryBasic, Chaingeareable, ERC721Token, SplitPaymentChangeable {

    using SafeMath for uint256;
    
    /*
    *  Storage
    */

    struct EntryMeta {
        address owner;
        address creator;
        uint createdAt;
        uint lastUpdateTime;
        uint256 currentEntryBalanceETH;
        uint256 accumulatedOverallEntryETH;
    }
    
    EntryMeta[] internal entriesMeta;

    /*
    *  Constructor
    */

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
        createEntryPermissionGroup = CreateEntryPermissionGroup.OnlyAdmin;
        entryCreationFee = 0;
        registrySafe = new Safe();
        registryInitStatus = false;
    }
    
    /*
    *  Public functions
    */

    function initializeRegistry(
        string _linkToABIOfEntriesContract,
        bytes _entryCore
    )
        public
        onlyAdmin
        returns (
            address
        )
    {
        address deployedAddress;
        assembly {
            let s := mload(_entryCore)
            let p := add(_entryCore, 0x20)
            deployedAddress := create(0, p, s)
        }

        assert(deployedAddress != 0x0);
        entriesStorage = deployedAddress;
        registryInitStatus = true;
        linkToABIOfEntriesContract = _linkToABIOfEntriesContract;
        
        return entriesStorage;
    }

    /**
    * @dev entry creation
    * @return uint256
    */
    function createEntry()
        public
        registryInitialized
        onlyPermissionedToCreateEntries
        whenNotPaused
        payable
        returns (
            uint256
        )
    {
        require(msg.value == entryCreationFee);
        
        // TODO check for uniqueness for fields (+protected by uniq field gen)
        
        uint256 newEntryId = EntryBasic(entriesStorage).createEntry();
        _mint(msg.sender, newEntryId);
        
        EntryMeta memory meta = (EntryMeta(
        {
            lastUpdateTime: block.timestamp,
            createdAt: block.timestamp,
            owner: msg.sender,
            creator: msg.sender,
            currentEntryBalanceETH: 0,
            accumulatedOverallEntryETH: 0
        }));
        
        entriesMeta.push(meta);

        emit EntryCreated(msg.sender, newEntryId);

        return newEntryId;
    }

    /**
    * @dev delegate tokenized ownership to new admin
    * @param _newOwner address 
    */
    function transferAdminRights(
        address _newOwner
    )
        public
        onlyOwner
        whenNotPaused
    {
        admin = _newOwner;
    }

    /**
    * @dev remove entry from the Regisrty
    * @param _entryID uint256
    */
    function deleteEntry(
        uint256 _entryID
    )
        public
        onlyOwnerOf(_entryID)
        whenNotPaused
    {
        uint256 entryIndex = allTokensIndex[_entryID];
        EntryBasic(entriesStorage).deleteEntry(entryIndex);
        _burn(msg.sender, _entryID);
        
        uint256 lastEntryIndex = entriesMeta.length - 1;
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
        registryInitialized
        onlyOwnerOf(_entryID)
        whenNotPaused
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
    function fundEntry(
        uint256 _entryID
    )
        public
        registryInitialized
        whenNotPaused
        payable
    {
        entriesMeta[_entryID].currentEntryBalanceETH = entriesMeta[_entryID].currentEntryBalanceETH.add(msg.value);
        entriesMeta[_entryID].accumulatedOverallEntryETH = entriesMeta[_entryID].accumulatedOverallEntryETH.add(msg.value);
        registrySafe.transfer(msg.value);

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
        registryInitialized
        onlyOwnerOf(_entryID)
        whenNotPaused
    {
        require(_amount <= entriesMeta[_entryID].currentEntryBalanceETH);
        entriesMeta[_entryID].currentEntryBalanceETH = entriesMeta[_entryID].currentEntryBalanceETH.sub(_amount);
        Safe(registrySafe).claim(msg.sender, _amount);

        emit EntryFundsClaimed(_entryID, msg.sender, _amount);
    }
    
    /*
    *  External functions
    */
    
    function updateEntryTimestamp(
        uint256 _entryID
    ) 
        external
    {
        require(entriesStorage == msg.sender);
        entriesMeta[_entryID].lastUpdateTime = block.timestamp;
    }
    
    /*
    *  View functions
    */

    /**
    * @dev safe balance getter
    * @return uint
    */
    function getSafeBalance()
        public
        view
        returns (
            uint balance
        )
    {
        return address(registrySafe).balance;
    }
    
    function getEntryMeta(uint256 _entryID)
        public
        view
        returns (
            address,
            address,
            uint,
            uint,
            uint256,
            uint256
        )
    {
        return(
            entriesMeta[_entryID].owner,
            entriesMeta[_entryID].creator,
            entriesMeta[_entryID].createdAt,
            entriesMeta[_entryID].lastUpdateTime,
            entriesMeta[_entryID].currentEntryBalanceETH,
            entriesMeta[_entryID].accumulatedOverallEntryETH
        );
    }
    
    function checkAuth(uint256 _entryID, address _caller)
        public
        view
        returns (
            bool
        )
    {
        return (ownerOf(_entryID) == _caller ? true : false);
    }
}
