pragma solidity 0.4.21;

import "./RegistryPermissionControl.sol";


contract Chaingeareable is RegistryPermissionControl {

    uint internal entryCreationFee_;
    string internal registryName_;
    string internal registryDescription_;
    bytes32[] internal registryTags_;
    address internal entryBase_;
    string internal linkToABIOfEntriesContract_;

    address internal registrySafe_;

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

    function entryBase()
        public
        view
        returns (address)
    {
        return entryBase_;
    }

    function ABIOfEntriesContract()
        public
        view
        returns (string)
    {
        return linkToABIOfEntriesContract_;
    }

    function registryBalance()
        public
        view
        returns (uint)
    {
        return address(this).balance;
    }

    function entryCreationFee()
        public
        view
        returns (uint)
    {
        return entryCreationFee_;
    }

    function registryName()
        public
        view
        returns (string)
    {
        return registryName_;
    }

    function registryDescription()
        public
        view
        returns (string)
    {
        return registryDescription_;
    }

    function registryTags()
        public
        view
        returns (bytes32[])
    {
        return registryTags_;
    }

    function updateEntryCreationFee(uint _fee)
        external
        onlyAdmin
    {
        entryCreationFee_ = _fee;
    }

    function updateRegistryName(string _registryName)
        external
        onlyAdmin
    {
        uint len = bytes(_registryName).length;
        require(len > 0 && len <= 32);

        registryName_ = _registryName;
    }

    function updateRegistryDescription(string _registryDescription)
        external
        onlyAdmin
    {
        uint len = bytes(_registryDescription).length;
        require(len <= 256);

        registryDescription_ = _registryDescription;
    }

    function addRegistryTag(bytes32 _tag)
        external
        onlyAdmin
    {
        require(_tag.length <= 16);

        registryTags_.push(_tag);
    }

    function updateRegistryTag(uint256 _index, bytes32 _tag)
        external
        onlyAdmin
    {
        require(_tag.length <= 16);

        registryTags_[_index] = _tag;
    }

    function removeRegistryTag(uint256 _index, bytes32 _tag)
        external
        onlyAdmin
    {
        require(_tag.length <= 16);

        uint256 lastTagIndex = registryTags_.length - 1;
        bytes32 lastTag = registryTags_[lastTagIndex];

        registryTags_[_index] = lastTag;
        registryTags_[lastTagIndex] = ""; //""?
        registryTags_.length--;
    }

    function registrySafe()
        public
        view
        returns (address)
    {
        return registrySafe_;
    }
}
