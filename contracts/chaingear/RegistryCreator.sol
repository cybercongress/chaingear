pragma solidity ^0.4.19;

import "../registry/Registry.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract RegistryCreator is Ownable {

    address internal builder_;

    function RegistryCreator(address _builder)
        public
    {
        builder_ = _builder;
    }

    function create(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol,
        string _linkToABIOfEntriesContract,
        bytes _bytecodeOfEntriesContract
    )
        external
        returns (Registry newRegistryContract)
    {
        require(msg.sender == builder_);

        newRegistryContract = createRegistry(
            _benefitiaries,
            _shares,
            _name,
            _symbol,
            _linkToABIOfEntriesContract,
            _bytecodeOfEntriesContract
        );

        return newRegistryContract;
    }

    function createRegistry(
        address[] _benefitiaries,
        uint256[] _shares,
        string _name,
        string _symbol,
        string _linkToABIOfEntriesContract,
        bytes _bytecodeOfEntriesContract
    )
        internal
        returns (Registry registryContract)
    {
        registryContract = new Registry(
            _benefitiaries,
            _shares,
            _name,
            _symbol,
            _linkToABIOfEntriesContract,
            _bytecodeOfEntriesContract
        );
        registryContract.transferOwnership(msg.sender);

        return registryContract;
    }

    function setBuilder(address _builder)
        external
        onlyOwner
    {
        builder_ = _builder;
    }

    function registryBuilder()
        public
        view
        returns (address)
    {
        return builder_;
    }
}
