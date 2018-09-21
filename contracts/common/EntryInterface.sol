pragma solidity ^0.4.24;


//// [review] Warning: use 'interface' instead of 'contract' 
interface EntryInterface {

    function entriesAmount() external view returns (uint256);
    function createEntry() external returns (uint256);
    function deleteEntry(uint256) external;
}
