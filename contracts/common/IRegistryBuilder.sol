pragma solidity 0.4.25;

import "../common/IRegistry.sol";


interface IRegistryBuilder {
    function deployRegistry(address[], uint256[], string, string) external returns (IRegistry);
}
