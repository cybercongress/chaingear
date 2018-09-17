pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../common/SplitPaymentChangeable.sol";
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
contract Registry is RegistryInterface, Chaingeareable, SplitPaymentChangeable, ERC721Token {

    using SafeMath for uint256;
    
    /*
    *  Storage
    */

    // @dev Metadata of entry, holds ownership data and funding info
    struct EntryMeta {
        address creator;
        uint createdAt;
        uint lastUpdateTime;

        //// [review] Better rename it to currentEntryBalanceWei
        uint256 currentEntryBalanceETH;
        //// [review] Better rename it to accumulatedOverallEntryWei
        uint256 accumulatedOverallEntryETH;
    }
    
    // @dev Array of associated to entry/token metadata
    EntryMeta[] internal entriesMeta;

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
        SplitPaymentChangeable(_benefitiaries, _shares)
        ERC721Token(_name, _symbol)
        public
        payable
    {
        //// [review] Move that to the SplitPaymentChangeable constructor!
        createEntryPermissionGroup = CreateEntryPermissionGroup.OnlyAdmin;

        //// [review] Should be moved to the Chaingeareable contract constructor!
        //// [review] Direct modification is not a good idea
        entryCreationFee = 0;

        //// [review] Should be moved to the Chaingeareable contract constructor!
        //// [review] Direct modification is not a good idea
        registrySafe = new Safe();

        //// [review] Should be moved to the Chaingeareable contract constructor!
        //// [review] Direct modification is not a good idea
        registryInitStatus = false;
    }
    
    function() public payable {}
    
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
            lastUpdateTime: block.timestamp,
            createdAt: block.timestamp,
            creator: msg.sender,
            currentEntryBalanceETH: 0,
            accumulatedOverallEntryETH: 0
        }));
        
        entriesMeta.push(meta);
        
        //newEntryID equals current entriesAmount number, because token IDs starts from 0
        //// [review] If entriesStorage does not support the EntryInterface -> can lead to VERY BAD THINGS
        uint256 newEntryID = EntryInterface(entriesStorage).entriesAmount();
        require(newEntryID == totalSupply());
        
        _mint(msg.sender, newEntryID);
        emit EntryCreated(newEntryID, msg.sender);

        //// [review] If entriesStorage does not support the EntryInterface -> can lead to VERY BAD THINGS
        uint256 createdEntryID = EntryInterface(entriesStorage).createEntry();
        require(newEntryID == createdEntryID);

        return newEntryID;
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
        require(entriesMeta[_entryID].currentEntryBalanceETH == 0);
        
        uint256 entryIndex = allTokensIndex[_entryID];
        
        //// [review] BUG: not checking the length
        //// [review] BUG: not using SafeMath. Can overflow
        uint256 lastEntryIndex = entriesMeta.length - 1;
        EntryMeta storage lastEntry = entriesMeta[lastEntryIndex];

        entriesMeta[_entryID] = lastEntry;
        delete entriesMeta[lastEntryIndex];
        entriesMeta.length--;
        
        _burn(msg.sender, _entryID);
        emit EntryDeleted(_entryID, msg.sender);
        
        //// [review] If entriesStorage does not support the EntryInterface -> can lead to VERY BAD THINGS
        EntryInterface(entriesStorage).deleteEntry(entryIndex);
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) 
        public 
        canTransfer(_tokenId)
        registryInitialized
    {
        require(_from != address(0));
        require(_to != address(0));

        clearApproval(_from, _tokenId);
        removeTokenFrom(_from, _tokenId);
        addTokenTo(_to, _tokenId);

        emit Transfer(_from, _to, _tokenId);
    }  

    /**
    * @dev Allows anyone fund specified entry
    * @param _entryID uint256 Entry-token ID
    * @notice Funds tracks in EntryMeta, stores in Registry Safe
    */
    function fundEntry(
        uint256 _entryID
    )
        external
        registryInitialized
        whenNotPaused
        payable
    {
        entriesMeta[_entryID].currentEntryBalanceETH = entriesMeta[_entryID].currentEntryBalanceETH.add(msg.value);
        entriesMeta[_entryID].accumulatedOverallEntryETH = entriesMeta[_entryID].accumulatedOverallEntryETH.add(msg.value);
        emit EntryFunded(_entryID, msg.sender, msg.value);
        
        registrySafe.transfer(msg.value);
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
        require(_amount <= entriesMeta[_entryID].currentEntryBalanceETH);
        entriesMeta[_entryID].currentEntryBalanceETH = entriesMeta[_entryID].currentEntryBalanceETH.sub(_amount);
        
        emit EntryFundsClaimed(_entryID, msg.sender, _amount);
        
        //// [review] If registrySafe does not support the Safe interface -> can lead to VERY BAD THINGS
        Safe(registrySafe).claim(msg.sender, _amount);
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
        entriesMeta[_entryID].lastUpdateTime = block.timestamp;
        //// [review] Use an onlyOwnerOf(_entryID) modifier instead
        require(entriesStorage == msg.sender);
    }
    
    /*
    *  View functions
    */
    
    function getEntryMeta(
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
            entriesMeta[_entryID].currentEntryBalanceETH,
            entriesMeta[_entryID].accumulatedOverallEntryETH
        );
    }
    
    /**
    * @dev Verification function which auth user to update specified entry data in EntryCore
    * @param _entryID uint256 Entry-token ID
    * @param _caller address of caller which trying to update entry throught EntryCore
    * @return  
    */
    function checkAuth(
        uint256 _entryID,
        address _caller
    )
        external
        view
        returns (bool)
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
        //// [review] Haven't found the 'name_' definition))))
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
        //// [review] Is it ok if ADMIN calls this method again? ))
        //// [review] Maybe better to move this method to the constructor??
        address deployedAddress;

        //// [review] It is better not to use assembly/arbitrary bytecode as it is very unsafe!
        assembly {
            let s := mload(_entryCore)
            let p := add(_entryCore, 0x20)
            //// [review] I am the EntryCore 'owner'
            deployedAddress := create(0, p, s)
        }

        assert(deployedAddress != 0x0);
        entriesStorage = deployedAddress;
        registryInitStatus = true;
        linkToABIOfEntriesContract = _linkToABIOfEntriesContract;
        
        return entriesStorage;
    }
    
}
