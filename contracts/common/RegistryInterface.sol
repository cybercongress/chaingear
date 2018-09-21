pragma solidity ^0.4.24;


interface RegistryInterface {
    
    function getSafeBalance() external view returns (uint256);
    function getAdmin() external view returns (address);
    function createEntry() external payable returns (uint256);
    function deleteEntry(uint256 _entryId) external;
    function fundEntry(uint256 _entryId) external payable;
    function claimEntryFunds(uint256 _entryId, uint _amount) external;
    function name() external view returns (string);
    function symbol() external view returns (string);
    function transferAdminRights(address _newOnwer) external;
    function transferOwnership(address _newOwner) external;
}
