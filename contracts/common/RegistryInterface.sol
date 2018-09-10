pragma solidity 0.4.24;


contract RegistryInterface {
    function getSafeBalance() external view returns (uint256);
    function getAdmin() external view returns (address);
    function createEntry() external payable returns (uint256);
    function deleteEntry(uint256 _entryId) external;
    function transferEntryOwnership(uint256 _entryId, address _newOwner) external;
    function fundEntry(uint256 _entryId) external payable;
    function claimEntryFunds(uint256 _entryId, uint _amount) external;
    function transferAdminRights(address _newOnwer) public;
    function transferOwnership(address _newOwner) public;
    function name() public view returns (string);
    function symbol() public view returns (string);
}
