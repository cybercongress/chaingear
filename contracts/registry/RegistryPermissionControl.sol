pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";


/**
* @title Registry permissions control contract
* @author Cyber•Congress
*/
contract RegistryPermissionControl is Pausable {
    
    /*
    *  Storage
    */
    
    address internal admin;
    
    enum CreateEntryPermissionGroup {OnlyAdmin, AllUsers}
    
    CreateEntryPermissionGroup internal createEntryPermissionGroup;
    
    /*
    *  Modifiers
    */
    
    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    modifier onlyPermissionedToCreateEntries() {
        if (createEntryPermissionGroup == CreateEntryPermissionGroup.OnlyAdmin) {
            require(msg.sender == admin);
        }
        _;
    }
    
    /*
    *  Public functions
    */
    
    function changeAdmin(
        address _newAdmin
    )
        public
        onlyOwner
        whenNotPaused
    {
        admin = _newAdmin;
    }

    function updateCreateEntryPermissionGroup(
        uint8 _createEntryPermissionGroup
    )
        public
        onlyAdmin
    {
        require(uint8(CreateEntryPermissionGroup.AllUsers) >= _createEntryPermissionGroup);
        createEntryPermissionGroup = CreateEntryPermissionGroup(_createEntryPermissionGroup);
    }
    
    /*
    *  View functions
    */
    
    function getAdmin()
        public
        view
        returns (
            address
        )
    {
        return admin;
    }
    
    function getRegistryPermissions()
        public
        view
        returns (
            uint8
        )
    {
        return uint8(createEntryPermissionGroup);
    }
}
