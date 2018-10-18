pragma solidity 0.4.25;

import "openzeppelin-solidity/contracts/introspection/SupportsInterfaceWithLookup.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/payment/SplitPayment.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "../common/IEntry.sol";
import "../common/IRegistry.sol";
import "../common/IConnector.sol";
import "../common/Safe.sol";
import "./RegistryPermissionControl.sol";


/**
* @title Registry First Type Contract
* @author cyber•Congress, Valery litvin (@litvintech)
* @dev This contract in current flow used for Registry creation throught fabric in Chaingear
* @dev Registry creates ERC721 for each entry, entry may be funded/funds claimed
* @dev Admin sets contracts (EntrCore) which defines entry schema
* @dev Entry creation/deletion/update permission are tokenized
* @notice not recommend to use before release!
*/
contract Registry is IRegistry, IConnector, RegistryPermissionControl, SupportsInterfaceWithLookup, SplitPayment, ERC721Token {

    using SafeMath for uint256;
    
    /*
    *  Storage
    */
    
    bytes4 internal constant InterfaceId_EntryCore = 0xd4b1117d;
    
    bytes4 internal constant InterfaceId_ChaingearRegistry =  0x52dddfe4;    

    // @dev Metadata of entry, holds ownership data and funding info
    struct EntryMeta {
        address     creator;
        uint256     createdAt;
        uint256     lastUpdateTime;
        uint256     currentWei;
        uint256     accumulatedWei;
    }
    
    // @dev Using for token creation, continuous enumeration
    uint256 internal headTokenID;
    
    // @dev Array of associated to entry/token metadata
    EntryMeta[] internal entriesMeta;
    
    // @dev entry creation fee 
    uint256 internal entryCreationFee;
    
    // @dev registry description string
    string internal registryDescription;
    
    // @dev registry tags
    bytes32[] internal registryTags;
    
    // @dev address of EntryCore contract, which specifies data schema and CRUD operations
    IEntry internal entriesStorage;
    
    // @dev link to IPFS hash to ABI of EntryCore contract
    string internal linkToABIEntryCore;
    
    // @dev address of Registry safe where funds store
    Safe internal registrySafe;

    // @dev state of was registry initialized with EntryCore or not
    bool internal registryInitStatus;
    
    // @dev also works as exist(_entryID)
    modifier onlyOwnerOf(uint256 _entryID){
        require(ownerOf(_entryID) == msg.sender);
        _;
    }
    
    // @dev don't allow to call registry entry functions before initialization
    modifier registryInitialized {
        require(registryInitStatus == true);
        _;
    }
    
    /**
    *  Events
    */

    event EntryCreated(
        uint256 entryID,
        address creator
    );

    event EntryChangedOwner(
        uint256 entryID,
        address newOwner
    );

    event EntryDeleted(
        uint256 entryID,
        address owner
    );

    event EntryFunded(
        uint256 entryID,
        address funder,
        uint256 amount
    );

    event EntryFundsClaimed(
        uint256 entryID,
        address owner,
        uint256 amount
    );

    /*
    *  Constructor
    */

    /** 
    * @dev Constructor of Registry, creates from fabric which triggers by chaingear
    * @param _benefitiaries address[] addresses of Registry benefitiaries
	* @param _shares uint256[] array with amount of shares by benefitiary
	* @param _name string Registry name, use for Registry ERC721
	* @param _symbol string Registry NFT symbol, use for Registry ERC721
    * @notice sets default entry creation policy to onlyAdmin
    * @notice sets default creation fee to zero
    * @notice Registry are inactive till he is not initialized with schema (EntryCore)
    */
    constructor(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol
    )
        SplitPayment    (_benefitiaries, _shares)
        ERC721Token     (_name, _symbol)
        public
        payable
    {
        _registerInterface(InterfaceId_ChaingearRegistry);
        headTokenID = 0;
        entryCreationFee = 0;
        registrySafe = new Safe();
        registryInitStatus = false;
    }
    
    function() external payable {}
    
    /*
    *  External functions
    */
    
    /**
    * @dev Creates ERC721 and init asscociated epmty entry in EntryCore
    * @return uint256 ID of ERC721 token
    * @notice Entry owner should to after token creation and entry init set
    * @notice entry data throught EntryCore updateEntry() 
    * @notice This (and deletion) would work if EntryCore correctly written
    * @notice otherwise nothing should happen with Registry
    */
    function createEntry()
        external
        registryInitialized
        onlyPermissionedToCreateEntries
        whenNotPaused
        payable
        returns (uint256)
    {
        require(msg.value == entryCreationFee);
        
        EntryMeta memory meta = (EntryMeta(
        {   
            /* solium-disable-next-line security/no-block-members */
            lastUpdateTime:     block.timestamp,
            /* solium-disable-next-line security/no-block-members */
            createdAt:          block.timestamp,
            creator:            msg.sender,
            currentWei:         0,
            accumulatedWei:     0
        }));
        entriesMeta.push(meta);
        
        uint256 newTokenID = headTokenID;
        super._mint(msg.sender, newTokenID);
        headTokenID = headTokenID.add(1);
        
        emit EntryCreated(newTokenID, msg.sender);

        entriesStorage.createEntry();
        
        return newTokenID;
    }

    /**
    * @dev Allow entry owner delete Entry-token and also Entry-data in EntryCore
    * @param _entryID uint256 Entry-token ID
    */
    function deleteEntry(uint256 _entryID)
        external
        registryInitialized
        onlyOwnerOf(_entryID)
        whenNotPaused
    {
        uint256 entryIndex = allTokensIndex[_entryID];
        require(entriesMeta[entryIndex].currentWei == 0);
        
        uint256 lastEntryIndex = entriesMeta.length.sub(1);
        EntryMeta memory lastEntry = entriesMeta[lastEntryIndex];
        
        entriesMeta[entryIndex] = lastEntry;
        delete entriesMeta[lastEntryIndex];
        entriesMeta.length--;
        
        super._burn(msg.sender, _entryID);
        emit EntryDeleted(_entryID, msg.sender);
        
        entriesStorage.deleteEntry(entryIndex);
    }

    /**
    * @dev Allows anyone fund specified entry
    * @param _entryID uint256 Entry-token ID
    * @notice Funds tracks in EntryMeta, stores in Registry Safe
    * @notice Anyone may fund any existing entry
    */
    function fundEntry(uint256 _entryID)
        external
        registryInitialized
        whenNotPaused
        payable
    {
        require(exists(_entryID) == true);
        
        uint256 entryIndex = allTokensIndex[_entryID];
        uint256 currentWei = entriesMeta[entryIndex].currentWei.add(msg.value);
        entriesMeta[entryIndex].currentWei = currentWei;
        
        uint256 accumulatedWei = entriesMeta[entryIndex].accumulatedWei.add(msg.value);
        entriesMeta[entryIndex].accumulatedWei = accumulatedWei;
        
        emit EntryFunded(_entryID, msg.sender, msg.value);
        address(registrySafe).transfer(msg.value);
    }

    /**
    * @dev Allows entry token owner claim entry funds
    * @param _entryID uint256 Entry-token ID
    * @param _amount uint256 Amount in wei which token owner claims
    * @notice Funds tracks in EntryMeta, transfers from Safe to claimer (owner)
    */
    function claimEntryFunds(uint256 _entryID, uint256 _amount)
        external
        registryInitialized
        onlyOwnerOf(_entryID)
        whenNotPaused
    {
        uint256 entryIndex = allTokensIndex[_entryID];
    
        uint256 currentWei = entriesMeta[entryIndex].currentWei;
        require(_amount <= currentWei);
        entriesMeta[entryIndex].currentWei = currentWei.sub(_amount);
    
        emit EntryFundsClaimed(_entryID, msg.sender, _amount);
        registrySafe.claim(msg.sender, _amount);
    }
    
    /**
    * @dev Allow to set last entry data update for entry-token meta
    * @param _entryID uint256 Entry-token ID
    * @notice Can be (should be) called only by EntryCore (updateEntry)
    */
    // function updateEntryTimestamp(uint256 _entryID) 
    //     external
    // {
    //     require(entriesStorage == msg.sender);
    //     uint256 entryIndex = allTokensIndex[_entryID];
    //     /* solium-disable-next-line security/no-block-members */
    //     entriesMeta[_entryID].lastUpdateTime = block.timestamp;
    // }
    
    
    /**
    * @dev Allows admin set new registration fee, which entry creators should pay
    * @param _fee uint256 In wei which should be payed for creation/registration
    * @notice whenPaused against front-running, whenNotPaused for now
    */
    function updateEntryCreationFee(uint256 _fee)
        external
        onlyAdmin
        whenNotPaused
    {
        entryCreationFee = _fee;
    }
    
    /**
    * @dev Allows update ERC721 token name (Registry Name)
    * @param _name string which represents name
    */
    function updateName(string _name)
        external
        onlyAdmin
    {
        name_ = _name;
    }
    
    /**
    * @dev Allows admin update registry description
    * @param _newDescription string Which represents description
    * @notice Length of description should be less than 256 bytes
    */
    function updateRegistryDescription(string _newDescription)
        external
        onlyAdmin
    {
        uint256 len = bytes(_newDescription).length;
        require(len <= 256);
    
        registryDescription = _newDescription;
    }
    
    /**
    * @dev Allows admin to add tag to registry
    * @param _tag bytes32 Tag
    * @notice Tags amount should be less or equal 16
    */
    function addRegistryTag(bytes32 _tag)
        external
        onlyAdmin
    {
        require(registryTags.length < 16);
        registryTags.push(_tag);
    }
    
    /**
    * @dev Allows admin to update update specified tag
    * @param _index uint8 Index of tag to update
    * @param _tag bytes32 New tag value
    */
    function updateRegistryTag(uint8 _index, bytes32 _tag)
        external
        onlyAdmin
    {
        require(_index < registryTags.length);
    
        registryTags[_index] = _tag;
    }

    /**
    * @dev Remove registry tag
    * @param _index uint8 Index of tag to delete
    */
    function removeRegistryTag(uint8 _index)
        external
        onlyAdmin
    {
        require(registryTags.length > 0);
        require(_index < registryTags.length);
    
        uint256 lastTagIndex = registryTags.length.sub(1);
        bytes32 lastTag = registryTags[lastTagIndex];
    
        registryTags[_index] = lastTag;
        registryTags[lastTagIndex] = "";
        registryTags.length--;
    }
    
    /*
    *  View functions
    */
    
    // TODO find why out of gas on migration if return all values
    function readEntryMeta(uint256 _entryID)
        external
        view
        returns (
            address,
            address,
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        require(exists(_entryID) == true);
        uint256 entryIndex = allTokensIndex[_entryID];
        
        return(
            ownerOf(_entryID),
            entriesMeta[entryIndex].creator,
            entriesMeta[entryIndex].createdAt,
            entriesMeta[entryIndex].lastUpdateTime,
            entriesMeta[entryIndex].currentWei,
            // entriesMeta[entryIndex].accumulatedWei
            uint256(0)
        );
    }
    
    function getEntriesIDs()
        external
        view
        returns (uint256[])
    {
        return allTokens;
    }
    
    function getIndexByID(uint256 _entryID)
        external
        view
        returns (uint256)
    {
        require(exists(_entryID) == true);
        return allTokensIndex[_entryID];
    }
    
    /**
    * @dev Allows to check which amount fee needed for entry creation/registration
    * @return uint256 Current amount in wei needed for registration
    */
    function getEntryCreationFee()
        external
        view
        returns (uint256)
    {
        return entryCreationFee;
    }

    /**
    * @dev Verification function which auth user to update specified entry in EntryCore
    * @param _entryID uint256 Entry-token ID
    * @param _caller address of caller which trying to update entry throught EntryCore 
    */
    // function checkEntryOwnership(uint256 _entryID, address _caller)
    //     external
    //     view
    // {
    //     require(ownerOf(_entryID) == _caller);
    // }
    
    function auth(uint256 _entryID, address _caller)
        external
    {
        require(msg.sender == address(entriesStorage));
        require(ownerOf(_entryID) == _caller);
        uint256 entryIndex = allTokensIndex[_entryID];
        entriesMeta[entryIndex].lastUpdateTime = block.timestamp;
    }
    
    /**
    * @dev Allows to get EntryCore contract which specified entry schema and operations
    * @return address of that contract
    */
    function getEntriesStorage()
        external
        view
        returns (address)
    {
        return address(entriesStorage);
    }
    
    /**
    * @dev Allows to get link interface of EntryCore contract
    * @return string with IPFS hash to JSON with ABI
    */
    function getInterfaceEntriesContract()
        external
        view
        returns (string)
    {
        return linkToABIEntryCore;
    }
    
    /**
    * @dev Allows to get registry balance which represents accumulated fees for entry creations
    * @return uint256 Amount in wei accumulated in Registry Contract
    */
    function getRegistryBalance()
        external
        view
        returns (uint256)
    {
        return address(this).balance;
    }
    
    /**
    * @dev Allows to get description of Registry
    * @return string which represents description 
    */
    function getRegistryDescription()
        external
        view
        returns (string)
    {
        return registryDescription;
    }
    
    /**
    * @dev Allows to get Registry Tags
    * @return bytes32[] array of tags
    */
    function getRegistryTags()
        external
        view
        returns (bytes32[])
    {
        return registryTags;
    }
    
    /**
    * @dev Allows to get address of Safe which Registry control (owns)
    * @return address of Safe contract
    */
    function getRegistrySafe()
        external
        view
        returns (address)
    {
        return registrySafe;
    }
    
    /**
    * @dev Allows to get amount of funds aggregated in Safe
    * @return uint256 Amount of funds in wei
    */
    function getSafeBalance()
        external
        view
        returns (uint256)
    {
        return address(registrySafe).balance;
    }
    
    function getRegistryInitStatus()
        external
        view
        returns (bool)
    {
        return registryInitStatus;
    }
    
    /**
    *  Public functions
    */
    
    /**
    * @dev Registry admin sets generated by them EntryCore contrats with thier schema and 
    * @dev needed supported entry-token logic
    * @param _linkToABI string link to IPFS hash which holds EntryCore's ABI
    * @param _entryCore bytes of contract which holds schema and accociated CRUD functions
    * @return address of deployed EntryCore
    */
    function initializeRegistry(string _linkToABI, bytes _entryCore)
        public
        onlyAdmin
        returns (address)
    {
        require(registryInitStatus == false);
        address deployedAddress;
    
        assembly {
            let s := mload(_entryCore)
            let p := add(_entryCore, 0x20)
            deployedAddress := create(0, p, s)
        }
    
        require(deployedAddress != address(0));
        // TODO fix this, failes on migrations...
        // SupportsInterfaceWithLookup support = SupportsInterfaceWithLookup(deployedAddress);
        // require(support.supportsInterface(InterfaceId_EntryCore));
        entriesStorage = IEntry(deployedAddress);
    
        linkToABIEntryCore = _linkToABI;
        registryInitStatus = true;
    
        return deployedAddress;
    }
    
    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) 
        public 
        registryInitialized
        whenNotPaused
    {
        super.transferFrom(_from, _to, _tokenId);
    }  
    
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    )
        public
        registryInitialized
        whenNotPaused
    {
        super.safeTransferFrom(_from, _to, _tokenId, "");
    }
    
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes _data
    )
        public
        registryInitialized
        whenNotPaused
    {
        transferFrom(_from, _to, _tokenId);
        /* solium-disable-next-line indentation */
        require(checkAndCallSafeTransfer(_from, _to, _tokenId, _data));
    }
}
