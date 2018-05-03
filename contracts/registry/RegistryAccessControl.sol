pragma solidity 0.4.19;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";

/**
* @title Registry access control processor
* @author Cyber•Congress
* @dev not recommend to use before release!
*/
contract RegistryAccessControl is Ownable, Pausable, Destructible {

    // @dev initiate registryOwner_ variable
    address internal registryOwner_;

    // @dev initiate permissionTypeEntries_ variable
    PermissionTypeEntries internal permissionTypeEntries_;

    enum PermissionTypeEntries {OnlyCreator, Whitelist, AllUsers}

    modifier onlyRegistryOwner() {
        require(msg.sender == registryOwner_);
        _;
    }

    modifier onlyPermissionedToEntries() {
        if (permissionTypeEntries_ == PermissionTypeEntries.OnlyCreator) {
            require(msg.sender == registryOwner_);
        }
        // if (permissionTypeEntries_ == PermissionTypeEntries.Whitelist) {
        //     require(whitelist[msg.sender] || msg.sender == registryOwner_);
        // }
        _;
    }

    /**
    * @dev Registry access control constructor
    */
    function RegistryAccessControl()
        public
    {
        registryOwner_ = tx.origin;
    }

    /**
    * @dev Registry owner getter
    * @param address of Registry' owner
    */
    function registryOwner()
        public
        view
        returns (address)
    {
        return registryOwner_;
    }

    /**
    * @dev permissions type entries getter
    * @param type of permissions for entries
    */
    function permissionsTypeEntries()
        public
        view
        returns (PermissionTypeEntries)
    {
        return permissionTypeEntries_;
    }

    /**
    * @dev permissions type entries setter
    */
    function updatePermissionTypeEntries(uint _permissionTypeEntries)
        external
        onlyRegistryOwner
    {
        require(uint(PermissionTypeEntries.AllUsers) >= _permissionTypeEntries);
        permissionTypeEntries_ = PermissionTypeEntries(_permissionTypeEntries);
    }

}
