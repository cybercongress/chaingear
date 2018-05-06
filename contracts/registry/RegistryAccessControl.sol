pragma solidity 0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";


contract RegistryAccessControl is Ownable, Pausable {

    address public registryAdmin;

    // can use constructor for admin with tx.origin or transfer in chaingear on creation
    constructor()
    {
        registryAdmin = tx.origin;
    }

    modifier onlyRegistryAdmin() {
        require(msg.sender == registryAdmin);
        _;
    }

    PermissionTypeEntries internal permissionTypeEntries_;

    //todo rename
    enum PermissionTypeEntries {OnlyAdmin, AllUsers}

    modifier onlyPermissionedToEntries() {
        if (permissionTypeEntries_ == PermissionTypeEntries.OnlyAdmin) {
            require(msg.sender == registryAdmin);
        }
        _;
    }

    function permissionsTypeEntries()
        public
        view
        returns (PermissionTypeEntries)
    {
        return permissionTypeEntries_;
    }

    function updatePermissionTypeEntries(uint _permissionTypeEntries)
        external
        onlyRegistryAdmin
    {
        require(uint(PermissionTypeEntries.AllUsers) >= _permissionTypeEntries);
        permissionTypeEntries_ = PermissionTypeEntries(_permissionTypeEntries);
    }

}
