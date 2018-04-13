pragma solidity ^0.4.18;

import "../common/IPFSeable.sol";
import "../common/ChaingearRegistrable.sol";
import "./RegistryAccessControl.sol";


contract Chaingeareable is IPFSeable, ChaingearRegistrable, RegistryAccessControl {

    uint internal entryCreationFee_;
    string internal registryName_;
    string internal registryDescription_;
    bytes32[] internal registryTags_;

    bytes32 internal chaingearVersion = "1.0";

    address internal registrySafe_;

    /* uint256 public currentRegistryBalanceETH;
    uint256 public accumulatedOverallRegistryETH; */

    function implementsChaingearedRegistry()
        public
        view
        returns (bool)
    {
        return true;
    }

    function setChaingearMode(address _originAddress, bool _mode)
        public
        returns (bool)
    {
        require(tx.origin == owner);
        require(_originAddress == owner);
        chaingearModeState = _mode;
        if (_mode == true) {
            chaingearAddress = msg.sender;
        } else {
            chaingearAddress = address(0);
        }
        return chaingearModeState;
    }

    function chaingearModeStatus()
        public
        view
        returns (bool)
    {
        return chaingearModeState;
    }

    function getChaingeareableVersion()
        public
        view
        returns (bytes32)
    {
        return chaingearVersion;
    }

    function transferTokenizedOnwerhip(address _originAddress, address newOwner)
        onlyChaingear
        onlyChaingearModeOn
        public
        returns (bool)
    {
        require(tx.origin == owner);
        require(_originAddress == owner);

        require(newOwner != address(0));
        TokenizedOwnershipTransferred(_originAddress, newOwner);
        owner = newOwner;
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


    function updateABILink(string _linkABI)
        external
        onlyOwner
    {
        linkABI_ = _linkABI;
         ABILinkUpdated(_linkABI);
    }

    function setMetaLink(string _linkMeta)
        external
        onlyOwner
    {
        linkMeta_ = _linkMeta;
         MetaLinkUpdated(_linkMeta);
    }

    function setSourceLink(string _linkSourceCode)
        external
        onlyOwner
    {
        linkSourceCode_ = _linkSourceCode;
         SourceLinkUpdated(_linkSourceCode);
    }

    function registrySafe()
        public
        view
        returns (address)
    {
        return registrySafe_;
    }
}
