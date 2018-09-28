pragma solidity ^0.4.24;


interface EntryInterface {

    function createEntry(uint256) external;
    function deleteEntry(uint256) external;
    function entriesAmount() external view returns (uint256);
}
