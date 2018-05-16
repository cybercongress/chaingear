pragma solidity 0.4.23;

import "../common/Adminable.sol";


/**
* @title Registry permissions control contract
* @author Cyber•Congress
*/
contract RegistryPermissionControl is Adminable {

    enum CreateEntryPermissionGroup {OnlyAdmin, AllUsers}


    CreateEntryPermissionGroup public createEntryPermissionGroup_;

    modifier onlyPermissionedToCreateEntries() {
        if (createEntryPermissionGroup_ == CreateEntryPermissionGroup.OnlyAdmin) {
            require(msg.sender == admin_);
        }
        _;
    }

    function updateCreateEntryPermissionGroup(uint _createEntryPermissionGroup)
        external
        onlyAdmin
    {
        createEntryPermissionGroup_ = CreateEntryPermissionGroup(_createEntryPermissionGroup);
    }
}
