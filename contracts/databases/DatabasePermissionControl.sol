pragma solidity 0.4.25;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
* @title Chaingear - the novel Ethereum database framework
* @author cyber•Congress, Valery litvin (@litvintech)
* @notice not audited, not recommend to use in mainnet
*/
contract DatabasePermissionControl is Ownable, Pausable {
    
    /*
    *  Storage
    */
    
    enum CreateEntryPermissionGroup {OnlyAdmin, Whitelist, AllUsers}
    
    address private admin;

    mapping(address => bool) private whitelist;
    
    CreateEntryPermissionGroup private permissionGroup = CreateEntryPermissionGroup.OnlyAdmin;
    
    /*
    *  Constructor
    */
    
    constructor()
        public
    { }
    
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
