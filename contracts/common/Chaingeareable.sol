pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";
/* import "zeppelin-solidity/contracts/ownership/Claimable.sol"; */
/* import "zeppelin-solidity/contracts/ownership/Whitelist.sol"; */
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./SplitPaymentChangeable.sol";
import "./IPFSeable.sol";
import "./ChaingearRegistreable.sol";


contract Chaingeareable is Ownable, IPFSeable, Destructible, Pausable, SplitPaymentChangeable {

    string public name;
    string public description;
    string public tags;
    PermissionType public permissionType;
    uint public entryCreationFee;

    enum PermissionType {OnlyOwner, AllUsers, Whitelist}

    function Chaingeareable(
        address[] _benefitiaries,
        uint256[] _shares,
        PermissionType _permissionType,
        uint _entryCreationFee,
        string _linkABI,
        string _linkMeta,
        string _name,
        string _description,
        string _tags
    ) SplitPaymentChangeable(_benefitiaries, _shares) IPFSeable(_linkABI, _linkMeta) public
    {
        permissionType = _permissionType;
        entryCreationFee = _entryCreationFee;
        name = _name;
        description = _description;
        tags = _tags;
    }

    function updateEntryCreationFee(uint _fee) external onlyOwner {
        entryCreationFee = _fee;
    }

    function updatePermissionType(PermissionType _permissionType) external onlyOwner {
        permissionType = _permissionType;
    }

    function updateName(string _name) external onlyOwner {
        uint len = bytes(_name).length;
        require(len > 0 && len <= 32);

        name = _name;
    }

    function updateDescription(string _description) external onlyOwner {
        uint len = bytes(_description).length;
        require(len <= 256);

        description = _description;
    }

    //change to array
    function updateTags(string _tags) external onlyOwner {
        uint len = bytes(_tags).length;
        require(len <= 64);

        tags = _tags;
    }

    function registerInChaingear(string _name, address _chaingearAddress) external onlyOwner {
        ChaingearRegistreable chaingear = ChaingearRegistreable(_chaingearAddress);
        chaingear.register(_name, this);
    }
}
