pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
* @title RegistryPermissionControl contract
* @author cyber•Congress, Valery litvin (@litvintech)
* @dev Controls registry adminship logic and permission to entry management
* @notice not recommend to use before release!
*/
contract RegistryPermissionControl is Ownable, Pausable {
    
    /*
    *  Storage
    */
    
    enum CreateEntryPermissionGroup {OnlyAdmin, Whitelist, AllUsers}
    
    address internal admin;

    mapping(address => bool) whitelist;
    
    CreateEntryPermissionGroup internal permissionGroup;
    
    /*
    *  Constructor
    */
    
    constructor()
        public
    {
        permissionGroup = CreateEntryPermissionGroup.OnlyAdmin;
        admin = address(0);
    }
    
    /*
    *  Modifiers
    */
    
    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    modifier onlyPermissionedToCreateEntries() {
        if (permissionGroup == CreateEntryPermissionGroup.OnlyAdmin) {
            require(msg.sender == admin);
        } else if (permissionGroup == CreateEntryPermissionGroup.Whitelist) {
            require(whitelist[msg.sender] == true || msg.sender == admin);
        }
        _;
    }
    
    /*
    *  External functions
    */
    
    /**
    * @dev Allows owner (in main workflow - chaingear) transfer admin right
    * @dev if previous admin transfer associated ERC721 token.
    * @param _newAdmin address of new token holder/registry admin
    * @notice triggered by chaingear in main workflow (when registry non-registered from CH) 
    * @notice admin cannot transfer their own right cause right are tokenized and associated with
    * @notice ERC721 token, which logic controls chaingear contract
    */
    function transferAdminRights(address _newAdmin)
        external
        onlyOwner
        whenNotPaused
    {
        require(_newAdmin != address(0));
        admin = _newAdmin;
    }

    function updateCreateEntryPermissionGroup(
        CreateEntryPermissionGroup _newPermissionGroup
    )
        external
        onlyAdmin
        whenNotPaused
    {
        require(CreateEntryPermissionGroup.AllUsers >= _newPermissionGroup);
        permissionGroup = _newPermissionGroup;
    }
    
    function addToWhitelist(address _address)
        external
        onlyAdmin
        whenNotPaused
    {
        whitelist[_address] = true;
    }

    function removeFromWhitelist(address _address)
        external
        onlyAdmin
        whenNotPaused
    {
        whitelist[_address] = false;
    }
    
    function getAdmin()
        external
        view
        returns (address)
    {
        return admin;
    }
    
    function getRegistryPermissions()
        external
        view
        returns (CreateEntryPermissionGroup)
    {
        return permissionGroup;
    }
    
    function checkWhitelisting(address _address)
        external
        view
        returns (bool)
    {
        return whitelist[_address];
    }
        
}
