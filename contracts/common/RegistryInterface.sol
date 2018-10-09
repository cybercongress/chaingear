pragma solidity 0.4.25;


interface RegistryInterface {
    
    function createEntry() external payable returns (uint256);
    function deleteEntry(uint256) external;
    
    function getEntriesStorage() external view returns (address);
    function getEntriesIDs() external view returns (uint256[]);
    
    function fundEntry(uint256) external payable;
    function claimEntryFunds(uint256, uint256) external;
    
    function transferAdminRights(address) external;
    function transferOwnership(address) external;
    
    function getAdmin() external view returns (address);
    function getSafeBalance() external view returns (uint256);
    
    // function name() external view returns (string);
    // function symbol() external view returns (string);
    
    function supportsInterface(bytes4) external view returns (bool);
    // function totalSupply() public view returns (uint256);
}
