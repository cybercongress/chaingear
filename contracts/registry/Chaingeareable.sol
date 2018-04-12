pragma solidity ^0.4.18;

import "../common/IPFSeable.sol";
import "./RegistryAccessControl.sol";


contract Chaingeareable is IPFSeable, RegistryAccessControl {

    uint internal entryCreationFee_;
    string internal registryName_;
    string internal registryDescription_;
    bytes32[] internal registryTags_;

    /* uint256 public currentRegistryBalanceETH;
    uint256 public accumulatedOverallRegistryETH; */

    function implementsChaingearRegistry()
        public
        view
        returns (bool _implementsChaingearRegistry)
    {
        return true;
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
        onlyOwner
    {
        entryCreationFee_ = _fee;
    }

    function updateRegistryName(string _registryName)
        external
        onlyOwner
    {
        uint len = bytes(_registryName).length;
        require(len > 0 && len <= 32);

        registryName_ = _registryName;
    }

    function updateRegistryDescription(string _registryDescription)
        external
        onlyOwner
    {
        uint len = bytes(_registryDescription).length;
        require(len <= 256);

        registryDescription_ = _registryDescription;
    }

    function addRegistryTag(bytes32 _tag)
        external
        onlyOwner
    {
        require(_tag.length <= 16);

        registryTags_.push(_tag);
    }

    function updateRegistryTag(uint256 _index, bytes32 _tag)
        external
        onlyOwner
    {
        require(_tag.length <= 16);

        registryTags_[_index] = _tag;
    }

    function removeRegistryTag(uint256 _index, bytes32 _tag)
        external
        onlyOwner
    {
        require(_tag.length <= 16);

        uint256 lastTagIndex = registryTags_.length - 1;
        bytes32 lastTag = registryTags_[lastTagIndex];

        registryTags_[_index] = lastTag;
        registryTags_[lastTagIndex] = ""; //""?
        registryTags_.length--;
    }
}
