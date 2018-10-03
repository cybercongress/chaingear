pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/introspection/SupportsInterfaceWithLookup.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/payment/SplitPayment.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Chaingeareable.sol";
import "../common/EntryInterface.sol";
import "../common/RegistryInterface.sol";
import "../common/Safe.sol";


/**
* @title Registry First Type Contract
* @author cyber•Congress, Valery litvin (@litvintech)
* @dev This contract in current flow used for Registry creation throught fabric in Chaingear
* @dev Registry creates ERC721 for each entry, entry may be funded/funds claimed
* @dev Admin sets contracts (EntrCore) which defines entry schema
* @dev Entry creation/deletion/update permission are tokenized
* @notice not recommend to use before release!
*/
contract Registry is RegistryInterface, SupportsInterfaceWithLookup, Chaingeareable, SplitPayment, ERC721Token {

    using SafeMath for uint256;
    
    /*
    *  Storage
    */
    bytes4 internal constant InterfaceId_EntryCore = 0xcf3c2b48;
    
    bytes4 internal constant InterfaceId_Registry = 0x52dddfe4;
    /*
     * 0x52dddfe4 ===
     *   bytes4(keccak256('createEntry()')) ^
     *   bytes4(keccak256('deleteEntry(uint256)')) ^
     *   bytes4(keccak256('fundEntry(uint256)')) ^
     *   bytes4(keccak256('claimEntryFunds(uint256, uint256)')) ^
     *   bytes4(keccak256('transferAdminRights(address)')) ^
     *   bytes4(keccak256('transferOwnership(address)')) ^
     *   bytes4(keccak256('getAdmin()')) ^
     *   bytes4(keccak256('getSafeBalance()'))
     */
    

    // @dev Metadata of entry, holds ownership data and funding info
    struct EntryMeta {
        address creator;
        uint createdAt;
        uint lastUpdateTime;
        uint256 currentEntryBalanceWei;
        uint256 accumulatedOverallEntryWei;
    }
    
    // @dev Using for token creation, continuous enumeration
    uint256 internal headTokenID;
    
    // @dev Array of associated to entry/token metadata
    EntryMeta[] internal entriesMeta;
    
    // @dev also works as exist(_entryID)
    modifier onlyOwnerOf(uint256 _entryID){
        require(ownerOf(_entryID) == msg.sender);
        _;
    }

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
        SplitPayment(_benefitiaries, _shares)
        ERC721Token(_name, _symbol)
        public
        payable
    {
        _registerInterface(InterfaceId_Registry);
        headTokenID = 0;
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
        returns (
            uint256
        )
    {
        require(msg.value == entryCreationFee);
        
        EntryMeta memory meta = (EntryMeta(
        {   
            /* solium-disable-next-line security/no-block-members */
            lastUpdateTime: block.timestamp,
            /* solium-disable-next-line security/no-block-members */
            createdAt: block.timestamp,
            creator: msg.sender,
            currentEntryBalanceWei: 0,
            accumulatedOverallEntryWei: 0
        }));
        entriesMeta.push(meta);
        
        uint256 newTokenID = headTokenID;
        super._mint(msg.sender, newTokenID);
        
        emit EntryCreated(
            newTokenID,
            msg.sender
        );
        
        entriesStorage.createEntry(newTokenID);
        headTokenID = headTokenID.add(1);
        return newTokenID;
    }

    /**
    * @dev Allow entry owner delete Entry-token and also Entry-data in EntryCore
    * @param _entryID uint256 Entry-token ID
    */
    function deleteEntry(
        uint256 _entryID
    )
        external
        registryInitialized
        onlyOwnerOf(_entryID)
        whenNotPaused
    {
        uint256 entryIndex = allTokensIndex[_entryID];
        require(entriesMeta[entryIndex].currentEntryBalanceWei == 0);
        
        uint256 lastEntryIndex = entriesMeta.length.sub(1);
        EntryMeta memory lastEntry = entriesMeta[lastEntryIndex];
        
        entriesMeta[entryIndex] = lastEntry;
        delete entriesMeta[lastEntryIndex];
        entriesMeta.length--;
        
        super._burn(msg.sender, _entryID);
        emit EntryDeleted(_entryID, msg.sender);
        
        entriesStorage.deleteEntry(_entryID);
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
        super.transferFrom(
            _from,
            _to,
            _tokenId
        );
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
        super.safeTransferFrom(
            _from,
            _to,
            _tokenId,
            ""
        );
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
        require(checkAndCallSafeTransfer(
            _from,
            _to,
            _tokenId,
            _data
        ));
    }

    /**
    * @dev Allows anyone fund specified entry
    * @param _entryID uint256 Entry-token ID
    * @notice Funds tracks in EntryMeta, stores in Registry Safe
    * @notice Anyone may fund any existing entry
    */
    function fundEntry(
        uint256 _entryID
    )
        external
        registryInitialized
        whenNotPaused
        payable
    {
        require(exists(_entryID) == true);
        
        uint256 entryIndex = allTokensIndex[_entryID];
        uint256 currentWei = entriesMeta[entryIndex].currentEntryBalanceWei.add(msg.value);
        entriesMeta[entryIndex].currentEntryBalanceWei = currentWei;
        
        uint256 accumulatedWei = entriesMeta[entryIndex].accumulatedOverallEntryWei.add(msg.value);
        entriesMeta[entryIndex].accumulatedOverallEntryWei = accumulatedWei;
        
        emit EntryFunded(
            _entryID,
            msg.sender,
            msg.value
        );
        
        address(registrySafe).transfer(msg.value);
    }

    /**
    * @dev Allows entry token owner claim entry funds
    * @param _entryID uint256 Entry-token ID
    * @param _amount uint Amount in wei which token owner claims
    * @notice Funds tracks in EntryMeta, transfers from Safe to claimer (owner)
    */
    function claimEntryFunds(
        uint256 _entryID, 
        uint _amount
    )
        external
        registryInitialized
        onlyOwnerOf(_entryID)
        whenNotPaused
    {
        uint256 entryIndex = allTokensIndex[_entryID];
        
        uint256 currentWei = entriesMeta[entryIndex].currentEntryBalanceWei;
        require(_amount <= currentWei);
        entriesMeta[entryIndex].currentEntryBalanceWei = currentWei.sub(_amount);
        
        emit EntryFundsClaimed(
            _entryID,
            msg.sender,
            _amount
        );
        
        registrySafe.claim(msg.sender, _amount);
    }
    
    /**
    * @dev Allow to set last entry data update for entry-token meta
    * @param _entryID uint256 Entry-token ID
    * @notice Can be (should be) called only by EntryCore (updateEntry)
    */
    function updateEntryTimestamp(
        uint256 _entryID
    ) 
        external
    {
        require(entriesStorage == msg.sender);
        /* solium-disable-next-line security/no-block-members */
        entriesMeta[_entryID].lastUpdateTime = block.timestamp;
    }
    
    /*
    *  View functions
    */
    
    function readEntryMeta(
        uint256 _entryID
    )
        external
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
            ownerOf(_entryID),
            entriesMeta[_entryID].creator,
            entriesMeta[_entryID].createdAt,
            entriesMeta[_entryID].lastUpdateTime,
            entriesMeta[_entryID].currentEntryBalanceWei,
            entriesMeta[_entryID].accumulatedOverallEntryWei
        );
    }
    
    function getEntriesIDs()
        external
        view
        returns (
            uint256[]
        )
    {
        return allTokens;
    }
    
    /**
    * @dev Verification function which auth user to update specified entry in EntryCore
    * @param _entryID uint256 Entry-token ID
    * @param _caller address of caller which trying to update entry throught EntryCore 
    */
    function checkEntryOwnership(
        uint256 _entryID,
        address _caller
    )
        external
        view
    {
        require(ownerOf(_entryID) == _caller);
    }
    
    /**
    * @dev Allows update ERC721 token name (Registry Name)
    * @param _name string which represents name
    */
    function updateName(
        string _name
    )
        external
        onlyAdmin
    {
        name_ = _name;
    }
    
    /*
    *  Public functions
    */

    /**
    * @dev Registry admin sets generated by them EntryCore contrats with thier schema and 
    * @dev needed supported entry-token logic
    * @param _linkToABIOfEntriesContract string link to IPFS hash which holds EntryCore's ABI
    * @param _entryCore bytes of contract which holds schema and accociated CRUD functions
    * @return address of deployed EntryCore
    */
    function initializeRegistry(
        string _linkToABIOfEntriesContract,
        bytes _entryCore
    )
        public
        onlyAdmin
        returns (address)
    {
        require(registryInitStatus == false);
        address deployedAddress;

        //// [review] It is better not to use assembly/arbitrary bytecode as it is very unsafe!
        assembly {
            let s := mload(_entryCore)
            let p := add(_entryCore, 0x20)
            //// [review] I am the EntryCore 'owner'
            deployedAddress := create(0, p, s)
        }

        require(deployedAddress != address(0));
        // require(deployedAddress.supportsInterface(InterfaceId_EntryCore));
        
        entriesStorage = EntryInterface(deployedAddress);
        registryInitStatus = true;
        linkToABIOfEntriesContract = _linkToABIOfEntriesContract;
        
        return deployedAddress;
    }
    
}
