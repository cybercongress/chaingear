pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";


contract IPFSeable is Ownable {

    string linkABI;
    string linkMeta;

    event MetaLinkUpdated (string linkMeta);

    function IPFSeable(string _linkABI, string _linkMeta) internal onlyOwner {
        linkABI = _linkABI;
        linkMeta = _linkMeta;
    }

    function updateMetaLink(string _linkMeta) external onlyOwner {
        linkMeta = _linkMeta;
        MetaLinkUpdated(_linkMeta);
    }
}
