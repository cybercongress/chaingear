pragma solidity 0.4.25;

import "../common/RegistryInterface.sol";


interface RegistryBuilderInterface {
    
    function deployRegistry(
        address[],
        uint256[],
        string,
        string
    ) external returns (RegistryInterface);
}
