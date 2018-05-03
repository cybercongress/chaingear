pragma solidity 0.4.23;


contract Adminable {
    
    address internal registryAdmin_;

    modifier onlyRegistryAdmin() {
        require(msg.sender == registryAdmin_);
        _;
    }

    constructor()
        public
    {
        registryAdmin_ = tx.origin;
    }

    function registryAdmin()
        public
        view
        returns (address)
    {
        return registryAdmin_;
    }
}
