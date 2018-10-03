pragma solidity ^0.4.24;


interface EntryInterface {

    function createEntry(uint256) external;
    function deleteEntry(uint256) external;
    function getEntriesAmount() external view returns (uint256);
    function getEntriesIDs() external view returns (uint256[]);
    function supportsInterface(bytes4) external view returns (bool);
}
