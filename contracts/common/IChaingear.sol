pragma solidity 0.4.25;

import "../common/IDatabaseBuilder.sol";


interface IChaingear {
    
    function addDatabaseBuilderVersion(
        string,
        IDatabaseBuilder,
        string,
        string
    ) external;
    function updateDatabaseBuilderDescription(string, string) external;
    function depricateDatabaseBuilder(string) external;
    function createDatabase(
        string,
        address[],
        uint256[],
        string,
        string
    ) external payable returns (address, uint256);
    function deleteDatabase(uint256) external;
    function fundDatabase(uint256) external payable;
    function claimDatabaseFunds(uint256, uint256) external;
    function updateCreationFee(uint256) external;
    function getAmountOfBuilders() external view returns (uint256);
    function getBuilderByID(uint256) external view returns(string);
    function getDatabaseBuilder(string) external view returns(address, string, string, bool);
    function getDatabasesIDs() external view returns (uint256[]);
    function getDatabaseIDByAddress(address) external view returns (uint256);
    function getDatabaseAddressByName(string) external view returns (address);
    function getDatabaseSymbolByID(uint256) external view returns (string);
    function getDatabaseIDBySymbol(string) external view returns (uint256);
    function getDatabase(uint256) external view returns (
        string,
        string,
        address,
        string,
        uint256,
        address,
        uint256
    );
    function getDatabaseBalance(uint256) external view returns (uint256, uint256);
    function getChaingearDescription() external pure returns (string);
    function getCreationFeeWei() external view returns (uint256);
    function getSafeBalance() external view returns (uint256);
    function getSafeAddress() external view returns (address);
    function getNameExist(string) external view returns (bool);
    function getSymbolExist(string) external view returns (bool);
}
