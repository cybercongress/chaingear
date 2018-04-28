pragma solidity 0.4.21;


contract RegistryBasic {
    
    function createEntry() external payable returns (uint256);
    function transferTokenizedOnwerhip(address _newOnwer) public;
    function deleteEntry(uint256 _entryId) external;
    function transferEntryOwnership(uint256 _entryId, address _newOwner) public;
    function fundEntry(uint256 _entryId) public payable;
    function claimEntryFunds(uint256 _entryId, uint _amount) public;
    function safeBalance() public view returns (uint);
    function transferOwnership(address _newOwner) public;
    
}
