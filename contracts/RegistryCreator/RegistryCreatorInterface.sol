pragma solidity ^0.4.24;

import "../common/RegistryInterface.sol";


interface RegistryCreatorInterface {
    
    function create(
        address[],
        uint256[],
        string,
        string
    ) external returns (RegistryInterface);
}
