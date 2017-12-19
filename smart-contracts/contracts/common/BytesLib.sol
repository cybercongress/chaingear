pragma solidity ^0.4.17;


library BytesLib {
    function concat(bytes memory _preBytes, bytes memory _postBytes) internal pure returns (bytes) {
        bytes memory tempBytes;
        
        assembly {
            tempBytes := mload(0x40)

            let length := mload(_preBytes)
            mstore(tempBytes, length)
            
            let mc := add(tempBytes, 0x20)
            let end := add(mc, length)
            
            for {
                let cc := add(_preBytes, 0x20)
            } lt(mc, end) {
                mc := add(mc, 0x20)
                cc := add(cc, 0x20)
            } {
                mstore(mc, mload(cc))
            }
            
            length := mload(_postBytes)
            mstore(tempBytes, add(length, mload(tempBytes)))
            
            mc := end
            end := add(mc, length)
            
            for {
                let cc := add(_postBytes, 0x20)
            } lt(mc, end) {
                mc := add(mc, 0x20)
                cc := add(cc, 0x20)
            } {
                mstore(mc, mload(cc))
            }
            
            //update free-memory pointer
            //allocating the array padded to 32 bytes like the compiler does now
            //make an additional check for a resulting zero-length array:
            //  if (sub - end == 0) then end = end + 1
            mstore(0x40, and(add(add(end, iszero(sub(mc, end))), 31), not(31)))
        }
        
        return tempBytes;
    }
}
