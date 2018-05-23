pragma solidity 0.4.23;

import "./RegistryPermissionControl.sol";

/**
* @title Entries processor for Chaingear
* @author Cyber•Congress
* @dev not recommend to use before release!
*/
contract Chaingeareable is RegistryPermissionControl {
    
    /*
    *  Storage
    */
    
    // @dev initiate entry creation fee uint
    uint internal entryCreationFee;
    // @dev initiate Registry description string
    string internal registryDescription;
    // @dev initiate Registry tags bytes32[]
    bytes32[] internal registryTags;
    // @dev initiate address of entry base
    address internal entriesStorage;
    // @dev initiate link to ABI of entries contract
    string internal linkToABIOfEntriesContract;
    // @dev initiate address of Registry safe
    address internal registrySafe;

    bool internal registryInitStatus;

    /*
    *  Modifiers
    */

    modifier registryInitialized {
        require(registryInitStatus == true);
        _;
    }
    
    /**
    *  Events
    */

    event EntryCreated(
        address creator,
        uint entryID
    );

    event EntryChangedOwner(
        uint entryID,
        address newOwner
    );

    event EntryDeleted(
        address owner,
        uint entryID
    );

    event EntryFunded(
        uint entryID,
        address funder
    );

    event EntryFundsClaimed(
        uint entryID,
        address owner,
        uint amount
    );

    /**
    *  External Functions
    */

    /**
    * @dev entry creation fee setter
    * @param _fee uint
    */
    function updateEntryCreationFee(
        uint _fee
    )
        external
        onlyAdmin
    {
        entryCreationFee = _fee;
    }

    /**
    * @dev Registry description setter
    * @param _registryDescription string
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
    * @dev add tags for Registry
    * @param _tag bytes32
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
    * @dev Registry tag setter
    * @param _index uint256
    * @param _tag bytes32
    */
    function updateRegistryTag(
        uint256 _index,
        bytes32 _tag
    )
        external
        onlyAdmin
    {
        require(_tag.length <= 16);

        registryTags[_index] = _tag;
    }

    /**
    * @dev remove tag from Registry
    * @param _index uint256
    * @param _tag bytes32
    */
    function removeRegistryTag(
        uint256 _index,
        bytes32 _tag
    )
        external
        onlyAdmin
    {
        require(_tag.length <= 16);

        uint256 lastTagIndex = registryTags.length - 1;
        bytes32 lastTag = registryTags[lastTagIndex];

        registryTags[_index] = lastTag;
        registryTags[lastTagIndex] = "";
        registryTags.length--;
    }
    
    /**
    *  View functions
    */

    /**
    * @dev entry base address getter
    * @return address of entry base
    */
    function getEntriesStorage()
        public
        view
        returns (
            address
        )
    {
        return entriesStorage;
    }

    /**
    * @dev link to ABI of entries contract getter
    * @return string link to ABI of entries contract
    */
    function getInterfaceEntriesContract()
        public
        view
        returns (
            string
        )
    {
        return linkToABIOfEntriesContract;
    }

    /**
    * @dev Registry balance getter
    * @return uint balance uint
    */
    function getRegistryBalance()
        public
        view
        returns (
            uint
        )
    {
        return address(this).balance;
    }

    /**
    * @dev entry creation fee getter
    * @return uint creation fee uint
    */
    function getEntryCreationFee()
        public
        view
        returns (
            uint
        )
    {
        return entryCreationFee;
    }

    /**
    * @dev Registry description getter
    * @return string description 
    */
    function getRegistryDescription()
        public
        view
        returns (
            string
        )
    {
        return registryDescription;
    }

    /**
    * @dev Registry tags getter
    * @return bytes32[]
    */
    function getRegistryTags()
        public
        view
        returns (
            bytes32[]
        )
    {
        return registryTags;
    }

    /**
    * @dev safe Registry
    * @return address of Registry safe
    */
    function getRegistrySafe()
        public
        view
        returns (
            address
        )
    {
        return registrySafe;
    }
    
    function getRegistryInitStatus()
        public
        view
        returns (
            bool
        )
    {
        return registryInitStatus;
    }
}
