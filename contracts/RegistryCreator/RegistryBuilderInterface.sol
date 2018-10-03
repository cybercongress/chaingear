pragma solidity ^0.4.24;

import "../common/RegistryInterface.sol";


interface RegistryBuilderInterface {
    
    function createRegistry(
        address[],
        uint256[],
        string,
        string
    ) external returns (RegistryInterface);
}
