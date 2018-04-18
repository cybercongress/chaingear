pragma solidity ^0.4.19;


contract EntryBase {
    
    struct EntryMeta {
        address owner;
        address creator;
        uint createdAt;
        uint lastUpdateTime;
        // uint currentEntryBalanceETH;
        // uint accumulatedOverallEntryETH;
    }
    
    function entriesAmount() public view returns (uint256);
    function createEntry(bytes) public returns (uint256);
    // function updateEntry(bytes) public;
    // function deleteEntry(bytes) public;
    
    function registryOwnerOf(uint256 _entryId) public view returns (address);
    function creatorOf(uint256 _entryId) public view returns (address);
    function createdAtOf(uint256 _entryId) public view returns (uint);
    function lastUpdateTimeOf(uint256 _entryId) public view returns (uint);

    // function currentEntryBalanceETHOf(uint256 _entryId)
    //     public
    //     view
    //     returns (uint)
    // {
    //     return entries[_entryId].metainformation.currentEntryBalanceETH;
    // }
    
    // function accumulatedOverallEntryETHOf(uint256 _entryId)
    //     public
    //     view
    //     returns (uint)
    // {
    //     return entries[_entryId].metainformation.accumulatedOverallEntryETH;
    // }
    
    function entryMeta(uint256 _entryId)
        public
        view
        returns (address, address, uint, uint)
    {
        return (
            registryOwnerOf(_entryId),
            creatorOf(_entryId),
            createdAtOf(_entryId),
            lastUpdateTimeOf(_entryId)
            // currentEntryBalanceETHOf(_entryId),
            // accumulatedOverallEntryETHOf(_entryId)
        );
    }

}
