pragma solidity 0.4.25;

import "../common/IDatabase.sol";


interface IDatabaseBuilder {
    
    function deployDatabase(
        address[],
        uint256[],
        string,
        string
    ) external returns (IDatabase);
    function setChaingearAddress(address) external;
    function getChaingearAddress() external view returns (address);
    function getOwner() external view returns (address);
}
