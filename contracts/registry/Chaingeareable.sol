pragma solidity 0.4.19;

/* import "../common/IPFSeable.sol"; */
import "./RegistryAccessControl.sol";
// import "../common/RegistrySafe.sol";

/**
* @title Entries processor for Chaingear
* @author Cyber•Congress
* @dev not recommend to use before release!
*/
contract Chaingeareable is RegistryAccessControl {
    // @dev initiate entry creation fee uint
    uint internal entryCreationFee_;
    // @dev initiate Registry name string
    string internal registryName_;
    // @dev initiate Registry description string
    string internal registryDescription_;
    // @dev initiate Registry tags bytes32[]
    bytes32[] internal registryTags_;
    // @dev initiate address of entry base
    address internal entryBase_;
    // @dev initiate link to ABI of entries contract
    string internal linkToABIOfEntriesContract_;

    // @dev initiate address of Registry safe
    address internal registrySafe_;


    /**
    * @dev events
    */
    event EntryCreated(
        address creator,
        uint entryId
    );

    /* event EntryUpdated(
        address owner,
        uint entryId
    ); */

    event EntryChangedOwner(
        uint entryId,
        address newOwner
    );

    event EntryDeleted(
        address owner,
        uint entryId
    );

    event EntryFunded(
        uint entryId,
        address funder
    );

    event EntryFundsClaimed(
        uint entryId,
        address owner,
        uint amount
    );

    /**
    * @dev entry base address getter
    * @return address of entry base
    */
    function entryBase()
        public
        view
        returns (address)
    {
        return entryBase_;
    }

    /**
    * @dev link to ABI of entries contract getter
    * @return link to ABI of entries contract
    */
    function ABIOfEntriesContract()
        public
        view
        returns (string)
    {
        return linkToABIOfEntriesContract_;
    }

    /**
    * @dev Registry balance getter
    * @return Registry balance uint
    */
    function registryBalance()
        public
        view
        returns (uint)
    {
        return this.balance;
    }

    /**
    * @dev entry creation fee getter
    * @return entry creation fee uint
    */
    function entryCreationFee()
        public
        view
        returns (uint)
    {
        return entryCreationFee_;
    }

    /**
    * @dev Registry name getter
    * @return Registry name string
    */
    function registryName()
        public
        view
        returns (string)
    {
        return registryName_;
    }

    /**
    * @dev Registry description getter
    * @return Registry description string
    */
    function registryDescription()
        public
        view
        returns (string)
    {
        return registryDescription_;
    }

    /**
    * @dev Registry tags getter
    * @return Registry tags bytes32[]
    */
    function registryTags()
        public
        view
        returns (bytes32[])
    {
        return registryTags_;
    }

    /**
    * @dev entry creation fee setter
    * @param uint fee
    */
    function updateEntryCreationFee(uint _fee)
        external
        onlyRegistryOwner
    {
        entryCreationFee_ = _fee;
    }

    /**
    * @dev Registry name setter
    * @param uint fee
    */
    function updateRegistryName(string _registryName)
        external
        onlyRegistryOwner
    {
        uint len = bytes(_registryName).length;
        require(len > 0 && len <= 32);

        registryName_ = _registryName;
    }

    /**
    * @dev Registry description setter
    * @param Registry description string
    */
    function updateRegistryDescription(string _registryDescription)
        external
        onlyRegistryOwner
    {
        uint len = bytes(_registryDescription).length;
        require(len <= 256);

        registryDescription_ = _registryDescription;
    }

    /**
    * @dev add tags for Registry
    * @param tag bytes32
    */
    function addRegistryTag(bytes32 _tag)
        external
        onlyRegistryOwner
    {
        require(_tag.length <= 16);

        registryTags_.push(_tag);
    }

    /**
    * @dev Registry tag setter
    * @param tag index
    * @param tag bytes32
    */
    function updateRegistryTag(uint256 _index, bytes32 _tag)
        external
        onlyRegistryOwner
    {
        require(_tag.length <= 16);

        registryTags_[_index] = _tag;
    }

    /**
    * @dev remove tag from Registry
    * @param tag index
    * @param tag bytes32
    */
    function removeRegistryTag(uint256 _index, bytes32 _tag)
        external
        onlyRegistryOwner
    {
        require(_tag.length <= 16);

        uint256 lastTagIndex = registryTags_.length - 1;
        bytes32 lastTag = registryTags_[lastTagIndex];

        registryTags_[_index] = lastTag;
        registryTags_[lastTagIndex] = ""; //""?
        registryTags_.length--;
    }

    /**
    * @dev safe Registry
    * @return address of Registry safe
    */
    function registrySafe()
        public
        view
        returns (address)
    {
        return registrySafe_;
    }

}
