pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./RegistryPermissionControl.sol";
import "../common/EntryInterface.sol";
import "../common/Safe.sol";


/**
* @title Chaingeareable
* @author cyber•Congress, Valery Litvin (@litvintech)
* @dev Storage of core data and setters/getters
* @notice not recommend to use before release!
*/
contract Chaingeareable is RegistryPermissionControl {
    
    using SafeMath for uint256;
    
    /*
    *  Storage
    */
    
    // @dev entry creation fee 
    uint internal entryCreationFee;
    
    // @dev registry description string
    string internal registryDescription;
    
    // @dev registry tags
    bytes32[] internal registryTags;
    
    // @dev address of EntryCore contract, which specifies data schema and operations
    EntryInterface internal entriesStorage;
    
    // @dev link to IPFS hash to ABI of EntryCore contract
    string internal linkToABIOfEntriesContract;
    
    // @dev address of Registry safe where funds store
    // @notice deployed on creation contract which hold funds
    Safe internal registrySafe;

    // @dev state of was registry initialized with EntryCore or not
    bool internal registryInitStatus;


    constructor() 
        public
    {
        entryCreationFee = 0;
        registrySafe = new Safe();
        registryInitStatus = false;
    }

    /*
    *  Modifiers
    */

    // @dev don't allow to call registry entry functions before initialization
    modifier registryInitialized {
        require(registryInitStatus == true);
        _;
    }
    
    /**
    *  Events
    */

    // @dev Signals that new entry-token added to Registry
    event EntryCreated(
        uint entryID,
        address creator
    );

    // @dev Signals that entry-token changed owner
    event EntryChangedOwner(
        uint entryID,
        address newOwner
    );

    // @dev Signals that entry-token deleted 
    event EntryDeleted(
        uint entryID,
        address owner
    );

    // @dev Signals that entry-token funded with given amount
    event EntryFunded(
        uint entryID,
        address funder,
        uint amount
    );

    // @dev Signals that entry-token funds claimed by owner with given amount
    event EntryFundsClaimed(
        uint entryID,
        address owner,
        uint amount
    );

    /**
    *  External Functions
    */

    /**
    * @dev Allows admin set new registration fee, which entry creators should pay
    * @param _fee uint In wei which should be payed for creation/registration
    */
    function updateEntryCreationFee(
        uint _fee
    )
        external
        onlyAdmin
        whenPaused
    {
        entryCreationFee = _fee;
    }

    /**
    * @dev Allows admin update registry description
    * @param _registryDescription string Which represents description
    * @notice Length of description should be less than 256 bytes
    */
    function updateRegistryDescription(
        string _registryDescription
    )
        external
        onlyAdmin
    {
        uint len = bytes(_registryDescription).length;
        require(len <= 256);

        registryDescription = _registryDescription;
    }

    /**
    * @dev Allows admin to add tag to registry
    * @param _tag bytes32 Tag
    * @notice Tags amount should be less than 16
    */
    function addRegistryTag(
        bytes32 _tag
    )
        external
        onlyAdmin
    {
        require(_tag.length <= 16);
        registryTags.push(_tag);
    }

    /**
    * @dev Allows admin to update update specified tag
    * @param _index uint16 Index of tag to update
    * @param _tag bytes32 New tag value
    */
    function updateRegistryTag(
        uint16 _index,
        bytes32 _tag
    )
        external
        onlyAdmin
    {
        require(_tag.length <= 16);
        require(_index < registryTags.length);

        registryTags[_index] = _tag;
    }

    /**
    * @dev Remove registry tag
    * @param _index uint16 Index of tag to delete
    */
    function removeRegistryTag(
        uint16 _index
    )
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
    
    /**
    *  View functions
    */

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
        return linkToABIOfEntriesContract;
    }

    /**
    * @dev Allows to get registry balance which represents accumulated fees for entry creations
    * @return uint Amount in wei accumulated in Registry Contract
    */
    function getRegistryBalance()
        external
        view
        returns (uint)
    {
        return address(this).balance;
    }

    /**
    * @dev Allows to check which amount fee needed for entry creation/registration
    * @return uint Current amount in wei needed for registration
    */
    function getEntryCreationFee()
        external
        view
        returns (uint)
    {
        return entryCreationFee;
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
    * @return uint Amount of funds in wei
    */
    function getSafeBalance()
        external
        view
        returns (uint balance)
    {
        return address(registrySafe).balance;
    }
    
    /**
    * @dev Allows to check state of Registry init with EntryCore
    * @return bool Yes/No
    */
    function getRegistryInitStatus()
        external
        view
        returns (bool)
    {
        return registryInitStatus;
    }
}
