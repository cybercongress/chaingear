pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
* @title RegistryPermissionControl contract
* @author cyber•Congress, Valery litvin (@litvintech)
* @dev Controls registry adminship logic and permission to entry management
* @notice Now support only OnlyAdmin/AllUsers permissions
* @notice not recommend to use before release!
*/
contract RegistryPermissionControl is Pausable {
    
    /*
    *  Storage
    */
    
    // @dev 
    address internal admin;
    
    // @dev Holds supported permission to create entry rights
    enum CreateEntryPermissionGroup {OnlyAdmin, AllUsers}
    
    // @dev Holds current permission group, onlyAdmin by default
    CreateEntryPermissionGroup internal permissionGroup;
    
    constructor()
        public
    {
        permissionGroup = CreateEntryPermissionGroup.OnlyAdmin;
        admin = owner;
    }
    
    /*
    *  Modifiers
    */
    
    // @dev Controls access granted only to admin
    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    // @dev Controls access to entry creation granted by setted permission group
    modifier onlyPermissionedToCreateEntries() {
        if (permissionGroup == CreateEntryPermissionGroup.OnlyAdmin) {
            require(msg.sender == admin);
        }
        _;
    }
    
    /*
    *  View functions
    */
    
    /**
    * @dev Allows to get current admin address account
    * @return address of admin
    */
    function getAdmin()
        external
        view
        returns (
            address
        )
    {
        return admin;
    }
    
    /**
    * @dev Allows to get current permission group
    * @return uint8 index of current group
    */
    function getRegistryPermissions()
        external
        view
        returns (
            CreateEntryPermissionGroup
        )
    {
        return permissionGroup;
    }
    
    /*
    *  Public functions
    */
    
    /**
    * @dev Allows owner (in main workflow - chaingear) transfer admin right
    * @dev if previous admin transfer associated ERC721 token.
    * @param _newAdmin address of new token holder/registry admin
    * @notice triggered by chaingear in main workflow (when registry non-registered from CH) 
    * @notice admin cannot transfer their own right cause right are tokenized and associated with
    * @notice ERC721 token, which logic controls chaingear contract
    */
    function transferAdminRights(
        address _newAdmin
    )
        external
        onlyOwner
        whenNotPaused
    {
        require(_newAdmin != 0x0);
        admin = _newAdmin;
    }

    /**
    * @dev Allows admin to set new permission group granted to create entries
    * @param _permissionGroup Index of needed group
    */
    function updateCreateEntryPermissionGroup(
        CreateEntryPermissionGroup _permissionGroup
    )
        public
        onlyAdmin
        whenNotPaused
    {
        require(CreateEntryPermissionGroup.AllUsers >= _permissionGroup);
        permissionGroup = _permissionGroup;
    }
    
}
