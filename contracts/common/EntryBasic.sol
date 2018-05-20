pragma solidity 0.4.23;


contract EntryBasic {

    function entriesAmount() public view returns (uint256);
    function createEntry() public returns (uint256);
    function deleteEntry(uint256) public;
}
