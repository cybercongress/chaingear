pragma solidity 0.4.19;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
/* import "zeppelin-solidity/contracts/lifecycle/Destructible.sol"; */
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./Adminable.sol";


contract RegistryAccessControl is Adminable, Ownable, Pausable {

    PermissionTypeEntries internal permissionTypeEntries_;

    enum PermissionTypeEntries {OnlyAdmin, Whitelist, AllUsers}

    modifier onlyPermissionedToEntries() {
        if (permissionTypeEntries_ == PermissionTypeEntries.OnlyAdmin) {
            require(msg.sender == registryAdmin_);
        }
        // if (permissionTypeEntries_ == PermissionTypeEntries.Whitelist) {
        //     require(whitelist[msg.sender] || msg.sender == registryOwner_);
        // }
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
