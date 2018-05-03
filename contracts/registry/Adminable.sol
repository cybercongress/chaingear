pragma solidity 0.4.23;


contract Adminable {
    
    address public registryAdmin;

    modifier onlyRegistryAdmin() {
        require(msg.sender == registryAdmin);
        _;
    }

    constructor()
        public
    {
        registryAdmin = tx.origin;
    }

}
