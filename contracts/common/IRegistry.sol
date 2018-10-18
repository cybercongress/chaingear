pragma solidity 0.4.25;


interface IRegistry {
    
    /*
     * 0x52dddfe4 ===
     *   bytes4(keccak256('createEntry()')) ^
     *   bytes4(keccak256('deleteEntry(uint256)')) ^
     *   bytes4(keccak256('fundEntry(uint256)')) ^
     *   bytes4(keccak256('claimEntryFunds(uint256, uint256)')) ^
     *   bytes4(keccak256('transferAdminRights(address)')) ^
     *   bytes4(keccak256('transferOwnership(address)')) ^
     *   bytes4(keccak256('getAdmin()')) ^
     *   bytes4(keccak256('getSafeBalance()'))
     */
    
    function createEntry() external payable returns (uint256);
    function deleteEntry(uint256) external;
    
    function transferAdminRights(address) external;
    function transferOwnership(address) external;
    
    function getAdmin() external view returns (address);
    function getSafeBalance() external view returns (uint256);
}
