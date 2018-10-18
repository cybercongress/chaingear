pragma solidity 0.4.25;

interface IConnector {
    function getIndexByID(uint256) external view returns (uint256);
    function getEntriesIDs() external view returns (uint256[]);
    function auth(uint256, address) external;
}
