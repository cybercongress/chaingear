pragma solidity ^0.4.17;


contract SampleEntry {
    string public str;
  
    function SampleEntry(string _str) public {
        str = _str;
    }
  
    function setStr(string _str) external {
        str = _str;
    }

}
