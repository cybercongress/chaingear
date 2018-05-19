pragma solidity 0.4.23;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

/**
* @title Registry permissions control contract
* @author Cyber•Congress
*/
contract RegistryPermissionControl is Pausable {
    
    address public admin_;
    enum CreateEntryPermissionGroup {OnlyAdmin, AllUsers}
    CreateEntryPermissionGroup public createEntryPermissionGroup_;
    
    modifier onlyAdmin() {
        require(msg.sender == admin_);
        _;
    }

    modifier onlyPermissionedToCreateEntries() {
        if (createEntryPermissionGroup_ == CreateEntryPermissionGroup.OnlyAdmin) {
            require(msg.sender == admin_);
        }
        _;
    }
    
    constructor()
        public
    {
        admin_ = tx.origin;
    }

    function updateCreateEntryPermissionGroup(uint _createEntryPermissionGroup)
        external
        onlyAdmin
    {
        createEntryPermissionGroup_ = CreateEntryPermissionGroup(_createEntryPermissionGroup);
    }

    function changeAdmin(address _newAdmin)
        public
        whenNotPaused
        onlyOwner
    {
        admin_ = _newAdmin;
    }
}
