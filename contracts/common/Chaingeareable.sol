pragma solidity ^0.4.18;

import "./IPFSeable.sol";
import "./ChaingearRegistreable.sol";
import "./SplitPaymentChangeable.sol";
import "./RegistryAccessControl.sol";


contract Chaingeareable is IPFSeable, SplitPaymentChangeable, RegistryAccessControl {
    uint public entryCreationFee_;
    string public registryName_;
    string public registryDescription_;
    bytes32[] public registryTags_;

    /* uint256 public currentRegistryBalanceETH;
    uint256 public accumulatedOverallRegistryETH; */

    address constant public CHAINGEAR_ADDRESS = 0x0;

    function updateEntryCreationFee(uint _fee) external onlyOwner {
        entryCreationFee_ = _fee;
    }

    function updateRegistryName(string _registryName) external onlyOwner {
        uint len = bytes(_registryName).length;
        require(len > 0 && len <= 32);

        registryName_ = _registryName;
    }

    function updateRegistryDescription(string _registryDescription) external onlyOwner {
        uint len = bytes(_registryDescription).length;
        require(len <= 256);

        registryDescription_ = _registryDescription;
    }

    function addRegistryTag(bytes32 _tag) external onlyOwner {
        require(_tag.length <= 16);

        registryTags_.push(_tag);
    }

    function updateRegistryTag(uint256 _index, bytes32 _tag) external onlyOwner {
        require(_tag.length <= 16);

        registryTags_[_index] = _tag;
    }

    function removeRegistryTag(uint256 _index, bytes32 _tag) external onlyOwner {
        require(_tag.length <= 16);

        uint256 lastTagIndex = registryTags_.length.sub(1);
        bytes32 lastTag = registryTags_[lastTagIndex];

        registryTags_[_index] = lastTag;
        registryTags_[lastTagIndex] = ""; //""?
        registryTags_.length--;
    }

    function registerInChaingear() public onlyOwner returns (uint256 registryId) {
        ChaingearRegistreable chaingear = ChaingearRegistreable(CHAINGEAR_ADDRESS);
        return chaingear.registerRegistry(registryName_, linkABI_, this);
    }
}
