pragma solidity 0.4.25;


interface IDatabase {
    
    function createEntry() external payable returns (uint256);
    function deleteEntry(uint256) external;
    
    function transferAdminRights(address) external;
    function transferOwnership(address) external;
    
    function getAdmin() external view returns (address);
    function getSafeBalance() external view returns (uint256);
    
}
