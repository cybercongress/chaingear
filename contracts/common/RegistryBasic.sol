pragma solidity 0.4.24;


contract RegistryBasic {
    
    function createEntry() public payable returns (uint256);
    function transferTokenizedOnwerhip(address _newOnwer) public;
    function deleteEntry(uint256 _entryId) public;
    function transferEntryOwnership(uint256 _entryId, address _newOwner) public;
    function fundEntry(uint256 _entryId) public payable;
    function claimEntryFunds(uint256 _entryId, uint _amount) public;
    function transferOwnership(address _newOwner) public;
    function getSafeBalance() public view returns (uint256);
    
}
