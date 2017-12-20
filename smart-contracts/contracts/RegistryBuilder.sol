pragma solidity ^0.4.17;

import "./common/Builder.sol";
import "./Registry.sol";
import "./RegistryCreator.sol";


contract RegistryBuilder is Builder {

    RegistryCreator public creator;

    function RegistryBuilder(
        RegistryCreator _creator,
        uint _buildingFee,
        address[] _benefitiaries,
        uint256[] _shares
    ) Builder(_benefitiaries, _shares) public
    {
        creator = _creator;
        buildingFee = _buildingFee;
    }
    
    function createRegistry(
        address _client,
        address[] _benefitiaries,
        uint256[] _shares,
        Registry.PermissionType _permissionType,
        uint _entryCreationFee,
        bytes _bytecode
    )
        external payable returns (address) 
    {
        require(msg.sender == owner || msg.value == buildingFee);

        address client;
        if (_client == 0x0) {
            client = msg.sender;
        } else {
            client = _client;
        }

        Registry instance = creator.create(_benefitiaries, _shares, _permissionType, _entryCreationFee, _bytecode);

        createdContracts[client].push(instance);
        Builded(client, instance);
        instance.transferOwnership(client);

        return instance;
    }

    function setCreator(RegistryCreator _creator) external onlyOwner {
        creator = _creator;
    }
}