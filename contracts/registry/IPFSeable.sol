pragma solidity ^0.4.18;


contract IPFSeable {

    string internal linkABI_;
    string internal linkMeta_;
    string internal linkSourceCode_;

    event MetaLinkUpdated (string linkMeta);
    event ABILinkUpdated (string linkABI);
    event SourceLinkUpdated (string linkSource);

    function linkABI()
        public
        view
        returns (string)
    {
        return linkABI_;
    }

    function linkMeta()
        public
        view
        returns (string)
    {
        return linkMeta_;
    }

    function linkSourceCode()
        public
        view
        returns (string)
    {
        return linkSourceCode_;
    }

}
