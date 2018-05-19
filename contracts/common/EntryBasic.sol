pragma solidity 0.4.23;


contract EntryBasic {

    function entriesAmount() public view returns (uint256 entryID);

    function createEntry() public returns (uint256 entryID);
    function deleteEntry(uint256 _entryIndex) public;

    function updateEntryOwnership(uint256 _entryID, address _newOwner) public;
    function updateEntryFund(uint256 _entryID, uint256 _amount) public;
    function claimEntryFund(uint256 _entryID, uint256 _amount) public;

    function entryMeta(uint256 _entryId) public view returns (address, address, uint, uint, uint, uint);

}
