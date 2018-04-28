pragma solidity 0.4.21;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./Adminable.sol";


contract RegistryAccessControl is Adminable, Ownable, Pausable {

    PermissionTypeEntries internal permissionTypeEntries_;

    enum PermissionTypeEntries {OnlyAdmin, AllUsers}

    modifier onlyPermissionedToEntries() {
        if (permissionTypeEntries_ == PermissionTypeEntries.OnlyAdmin) {
            require(msg.sender == registryAdmin_);
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
