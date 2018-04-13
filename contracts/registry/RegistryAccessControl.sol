pragma solidity ^0.4.18;

contract RegistryAccessControl {

    PermissionTypeEntries internal permissionTypeEntries_;

    enum PermissionTypeEntries {OnlyOwner, Whitelist, AllUsers}

    bool internal chaingearModeState = false;

    address internal chaingearAddress;

    modifier onlyChaingearModeOn() {
        require(chaingearModeState == true);
        _;
    }

    modifier onlyChaingearModeOff() {
        require(chaingearModeState == false);
        _;
    }

    modifier onlyPermissionedToEntries() {
        if (permissionTypeEntries_ == PermissionTypeEntries.OnlyOwner) {
            require(msg.sender == owner);
        } 
        // else if (permissionTypeEntries_ == PermissionTypeEntries.Whitelist) {
        //     require(whitelist[msg.sender] || msg.sender == owner);
        // }
        _;
    }

    function RegistryAccessControl()
        public
        payable
    {
        owner = msg.sender;
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
      onlyOwner
    {
        require(uint(PermissionTypeEntries.AllUsers) >= _permissionTypeEntries);
        permissionTypeEntries_ = PermissionTypeEntries(_permissionTypeEntries);
    }

    //ownable
    address public owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event TokenizedOwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyChaingear() {
        require(msg.sender == chaingearAddress);
        _;
    }

    function transferOwnership(address newOwner)
        onlyOwner
        onlyChaingearModeOff
        public
    {
        require(newOwner != address(0));
        OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    //pausable
    event Pause();
    event Unpause();

    bool public paused = false;

    modifier whenNotPaused() {
        require(!paused);
        _;
    }

    modifier whenPaused() {
        require(paused);
        _;
    }

    function pause()
        onlyOwner
        whenNotPaused
        public
    {
        paused = true;
        Pause();
    }

    function unpause()
        onlyOwner
        whenPaused
        public
    {
        paused = false;
        Unpause();
    }

    //Destructible

    function destroy()
        onlyOwner
        onlyChaingearModeOff
        public
    {
        selfdestruct(owner);
    }

    function destroyAndSend(address _recipient)
        onlyOwner
        onlyChaingearModeOff
        public
    {
        selfdestruct(_recipient);
    }
}
