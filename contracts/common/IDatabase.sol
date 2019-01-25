pragma solidity 0.4.25;

interface IDatabase {
    
    function createEntry() external payable returns (uint256);
    function auth(uint256, address) external;
    function deleteEntry(uint256) external;
    function fundEntry(uint256) external payable;
    function claimEntryFunds(uint256, uint256) external;
    function updateEntryCreationFee(uint256) external;
    function updateDatabaseDescription(string) external;
    function addDatabaseTag(bytes32) external;
    function updateDatabaseTag(uint8, bytes32) external;
    function removeDatabaseTag(uint8) external;
    function readEntryMeta(uint256) external view returns (
        address,
        address,
        uint256,
        uint256,
        uint256,
        uint256
    );
    function getChaingearID() external view returns (uint256);
    function getEntriesIDs() external view returns (uint256[]);
    function getIndexByID(uint256) external view returns (uint256);
    function getEntryCreationFee() external view returns (uint256);
    function getEntriesStorage() external view returns (address);
    function getSchemaDefinition() external view returns (string);
    function getDatabaseBalance() external view returns (uint256);
    function getDatabaseDescription() external view returns (string);
    function getDatabaseTags() external view returns (bytes32[]);
    function getDatabaseSafe() external view returns (address);
    function getSafeBalance() external view returns (uint256);
    function getDatabaseInitStatus() external view returns (bool);
    function pause() external;
    function unpause() external;
    function transferAdminRights(address) external;
    function getAdmin() external view returns (address);
    function getPaused() external view returns (bool);
    function transferOwnership(address) external;
    function deletePayees() external;
}
