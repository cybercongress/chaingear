pragma solidity 0.4.25;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
* @title Chaingear - the novel Ethereum database framework
* @author cyber•Congress, Valery litvin (@litvintech)
* @notice not audited, not recommend to use in mainnet
*/
contract DatabasePermissionControl is Ownable {

    /*
    *  Storage
    */

    enum CreateEntryPermissionGroup {OnlyAdmin, Whitelist, AllUsers}

    address private admin;
    bool private paused = true;

    mapping(address => bool) private whitelist;

    CreateEntryPermissionGroup private permissionGroup = CreateEntryPermissionGroup.OnlyAdmin;

    /*
    *  Events
    */

    event Pause();
    event Unpause();
    event PermissionGroupChanged(CreateEntryPermissionGroup);
    event AddedToWhitelist(address);
    event RemovedFromWhitelist(address);
    event AdminshipTransferred(address, address);

    /*
    *  Constructor
    */

    constructor()
        public
    { }

    /*
    *  Modifiers
    */

    modifier whenNotPaused() {
        require(!paused);
        _;
    }

    modifier whenPaused() {
        require(paused);
        _;
    }

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

    function pause()
        external
        onlyAdmin
        whenNotPaused
    {
        paused = true;
        emit Pause();
    }

    function unpause()
        external
        onlyAdmin
        whenPaused
    {
        paused = false;
        emit Unpause();
    }

    function transferAdminRights(address _newAdmin)
        external
        onlyOwner
        whenPaused
    {
        require(_newAdmin != address(0));
        emit AdminshipTransferred(admin, _newAdmin);
        admin = _newAdmin;
    }

    function updateCreateEntryPermissionGroup(CreateEntryPermissionGroup _newPermissionGroup)
        external
        onlyAdmin
        whenPaused
    {
        require(CreateEntryPermissionGroup.AllUsers >= _newPermissionGroup);
        
        permissionGroup = _newPermissionGroup;
        emit PermissionGroupChanged(_newPermissionGroup);
    }

    function addToWhitelist(address _address)
        external
        onlyAdmin
        whenPaused
    {
        whitelist[_address] = true;
        emit AddedToWhitelist(_address);
    }

    function removeFromWhitelist(address _address)
        external
        onlyAdmin
        whenPaused
    {
        whitelist[_address] = false;
        emit RemovedFromWhitelist(_address);
    }

    function getAdmin()
        external
        view
        returns (address)
    {
        return admin;
    }

    function getDatabasePermissions()
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
    
    function getPaused()
        external
        view
        returns (bool)
    {
        return paused;
    }
}
