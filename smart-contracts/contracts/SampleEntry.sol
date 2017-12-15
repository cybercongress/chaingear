pragma solidity ^0.4.17;


contract SampleEntry {
    string public str;
  
    function SampleEntry() public {
      
    }
  
    function setStr(string _str) external {
        str = _str;
    }

}
