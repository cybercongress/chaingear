pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";


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
    CreateEntryPermissionGroup internal createEntryPermissionGroup;
    
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
        if (createEntryPermissionGroup == CreateEntryPermissionGroup.OnlyAdmin) {
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
        returns (address)
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
        returns (uint8)
    {
        return uint8(createEntryPermissionGroup);
    }
    
    /*
    *  Public functions
    */
    
    /**
    * @dev Allows owner (in main workflow - chaingear) transfer admin right
    * @dev if previous admin transfer associated ERC721 token.
    * @param _newAdmin address of new token holder/registry admin
    * @notice triggers by chaingear in main workflow (when registry non-registered from CH) 
    */
    function transferAdminRights(
        address _newAdmin
    )
        public
        onlyOwner
        whenNotPaused
    {
        require(_newAdmin != 0x0);
        admin = _newAdmin;
    }

    /**
    * @dev Allows admin to set new permission group granted to create entries
    * @param _createEntryPermissionGroup uint8 index of needed group
    */
    function updateCreateEntryPermissionGroup(
        uint8 _createEntryPermissionGroup
    )
        public
        onlyAdmin
        whenNotPaused
    {
        require(uint8(CreateEntryPermissionGroup.AllUsers) >= _createEntryPermissionGroup);
        createEntryPermissionGroup = CreateEntryPermissionGroup(_createEntryPermissionGroup);
    }
    
}
