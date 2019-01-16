pragma solidity 0.4.25;

library ERC721MetadataValidation {

    function validateName(string _base) 
        internal
        pure
    {
        bytes memory _baseBytes = bytes(_base);
        for (uint i = 0; i < _baseBytes.length; i++) {
            require(_baseBytes[i] >= 0x61 && _baseBytes[i] <=0x7A || _baseBytes[i] >= 0x30 && _baseBytes[i] <= 0x39 || _baseBytes[i] == 0x2D);
        }
    }

    function validateSymbol(string _base) 
        internal
        pure
    {
        bytes memory _baseBytes = bytes(_base);
        for (uint i = 0; i < _baseBytes.length; i++) {
            require(_baseBytes[i] >= 0x41 && _baseBytes[i] <=0x5A || _baseBytes[i] >= 0x30 && _baseBytes[i] <= 0x39);
        }
    }
}