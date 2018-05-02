pragma solidity 0.4.21;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract EntryBasic {

    struct EntryMeta {
        address owner;
        address creator;
        uint createdAt;
        uint lastUpdateTime;
        uint currentEntryBalanceETH;
        uint accumulatedOverallEntryETH;
    }

    function entriesAmount() public view returns (uint256 entryID);

    function createEntry() public returns (uint256 entryID);
    function deleteEntry(uint256 _entryIndex) public;

    function updateEntryOwnership(uint256 _entryID, address _newOwner) public;
    function updateEntryFund(uint256 _entryID, uint256 _amount) public;
    function claimEntryFund(uint256 _entryID, uint256 _amount) public;

    function entryOwnerOf(uint256 _entryID) public view returns (address);
    function creatorOf(uint256 _entryID) public view returns (address);
    function createdAtOf(uint256 _entryID) public view returns (uint);
    function lastUpdateTimeOf(uint256 _entryID) public view returns (uint);
    function currentEntryBalanceETHOf(uint256 _entryID) public view returns (uint);
    function accumulatedOverallEntryETHOf(uint256 _entryID) public view returns (uint);

    function entryMeta(uint256 _entryId)
        public
        view
        returns (address, address, uint, uint, uint, uint)
    {
        return (
            entryOwnerOf(_entryId),
            creatorOf(_entryId),
            createdAtOf(_entryId),
            lastUpdateTimeOf(_entryId),
            currentEntryBalanceETHOf(_entryId),
            accumulatedOverallEntryETHOf(_entryId)
        );
    }

}
