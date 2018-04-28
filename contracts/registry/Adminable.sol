pragma solidity 0.4.21;


contract Adminable {
    
    address internal registryAdmin_;

    modifier onlyRegistryAdmin() {
        require(msg.sender == registryAdmin_);
        _;
    }

    function Adminable()
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
