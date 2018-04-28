pragma solidity ^0.4.17;

import "./Registry.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract RegistryCreator is Ownable {

    address public builder;

    function RegistryCreator(address _builder) public {
        builder = _builder;
    }

    function create(
        address[] _benefitiaries,
        uint256[] _shares,
        Registry.PermissionType _permissionType,
        uint _entryCreationFee,
        bytes _bytecode
    ) external returns (Registry result)
    {
        require(msg.sender == builder);

        result = new Registry(_benefitiaries, _shares, _permissionType, _entryCreationFee, _bytecode);
        result.transferOwnership(msg.sender);
    }

    function setBuilder(address _builder) external onlyOwner {
        builder = _builder;
    }

}