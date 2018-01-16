pragma solidity ^0.4.17;


contract TokenEntry {
    string public name;
    string public ticker;
  
    function TokenEntry(string _name, string _ticker) public {
        name = _name;
        ticker = _ticker;
    }
  
    function setName(string _name) external {
        name = _name;
    }

    function setTicker(string _ticker) external {
        require(bytes(_ticker).length == 3);
        ticker = _ticker;
    }

}
