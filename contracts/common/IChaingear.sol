pragma solidity 0.4.25;

interface IChaingear {
    function getRegistryIdByAddress(address) external view returns (uint256);
}
