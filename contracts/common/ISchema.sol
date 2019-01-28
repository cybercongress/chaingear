pragma solidity 0.4.25;


interface ISchema {

    function createEntry() external;
    function deleteEntry(uint256) external;
}
