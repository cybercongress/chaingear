pragma solidity 0.4.25;


interface IEntry {
    
    /**
     * 0xd4b1117d ===
     *   bytes4(keccak256('createEntry(uint256)')) ^
     *   bytes4(keccak256('deleteEntry(uint256)')) ^
     *   bytes4(keccak256('getEntriesAmount()')) ^
     *   bytes4(keccak256('getEntriesIDs()'))
     */

    function createEntry() external;
    function deleteEntry(uint256) external;
}
