## General Chaingear/Registry pipeline

```mermaid
sequenceDiagram
    participant 721 as Chaingear's ERC721
    participant O as Chaingear Owner
    participant CC as Chaingear Contract
    participant RC as Registry Creator (with Registry V1)
    participant U1 as User 1
    participant R as Registry
    participant S as Registry Safe
    participant EC as Entry Core 
    
    O->>RC: constructor
    Note over O, RC: Initializing with Registry V1 smart-contract
    
    O->>CC: constructor
    Note over O, CC: Also Initializing of ERC721 and SplitPayment
    
    O->>RC: setBuilder
    Note over O, RC: Set chaingear's contract address as builder
    
    O->>CC: addRegistryCreatorVersion
    Note over O, CC: Add RegistryCreator address to inner library of creators
    
    U1->>+CC: registerRegistry
    CC-->>RC: create
    RC-->>R: constructor
    RC-->>CC: returns Registry address
    R-->>S: new
    CC-->721: mint ID=0
    CC-->>-U1: returns Registry address, Registry Token ID ID=0
    Note over R, CC: Initializing ERC721 Registry token for User, creates Registry and sets User as Registry admin
    
    U1->>+R: initializeRegistry
    R-->>EC: constructor
    R-->>-U1: returns EntryCore address
    Note over U1, EC: User sets smart-contract with their custom data structure for registry, should implements RegistryBasic
    
    U1->>+R: createEntry
    R-->>EC: createEntry
    R-->>-U1: returns entryID ID=0
    Note over U1, EC: Initializing ERC721 Entry token for User, creates empty structured object 
    
    U1->>EC: updateEntry ID=0
    Note over U1, EC: User as token owner sets fields of Entry object with provided EntryID
    
    U1->>+EC: entryInfo ID=0
    EC-->>-U1: returns entry information
```

## Registry CRUD/tokenized Entry/Funds pipeline

```mermaid
sequenceDiagram
    participant A as Admin
    participant S as Registry Safe
    participant R as Registry
    participant EC as Entry Core
    participant U1 as User 1
    participant 721 as Registry's ERC721
    participant U2 as User 2
    participant U3 as User 3/Funder
    
    A->>+R: initializeRegistry
    R-->>EC: constructor
    R-->>-A: returns EntryCore address
    Note over A, EC: User sets smart-contract with their custom data structure for registry, should implements RegistryBasic
    
    A->>R: updateCreateEntryPermissionGroup
    Note over A, R: Available OnlyAdmin, Whitelist*, AllUsers groups
    
    U1->>+R: createEntry
    R-->>EC: createEntry
    R-->721: mint ID=0
    R-->>-U1: returns entryID ID=0
    Note over U1, R: df
    
    U1->>EC: updateEntry ID=0
    Note over U1, EC: User 1 as token owner sets fields of Entry object with provided EntryID
    
    U1->>+EC: entryInfo ID=0
    EC-->>-U1: returns entry information
    
    U1->>+R: transferEntryOwnership ID=0
    R-->721: removeTokenFrom ID=0
    R-->721: addTokenTo ID=0
    R-->>-EC: updateEntryOwnership
    Note over U1, R: df
    
    U2->>EC: updateEntry ID=0
    Note over U1, EC: User 1 as token owner sets fields of Entry object with provided EntryID
    
    U3->>+EC: entryInfo ID=0
    EC-->>-U3: returns entry information
    
    U3->>+R: fundEntry ID=0 funds=1ETH
    R-->>EC: updateEntryFund +1ETH
    R-->>-S: transfer =1ETH
    Note over S, EC: Funded ETHs goes to Registry Safe contract, ETHs adds to balance and amount for accounting stores in Registry.
    
    U2->>+R: claimEntryFund claim=1ETH
    R-->>EC: claimEntryFund -1ETH
    R-->>S: claim =1ETH
    S-->>-U2: transfer =1ETH
    Note over S, EC: Owner of Entry claim funds and registry checks balance for existing claim amount, subtract them, calls Registry Safe to send funds to User.
    
    U2->>+R: deleteEntry
    R-->721: burn ID=0
    R-->>-EC: deleteEntry
    Note over R, EC: Registry burns associated to Entry NFT token and deletes entry object in EntryCore.
```

## Chaingear tokenized Registries pipeline
```mermaid
sequenceDiagram
    participant 721 as Chaingear's ERC721
    participant U1 as User 1
    participant CC as Chaingear
    participant R as Registry
    participant U2 as User 2

    
    U1->>+CC: registerRegistry
    CC-->721: mint ID=0 to=User1
    CC-->>-U1: returns Registry address, Registry Token ID ID=0
    Note over 721, CC: Initializing ERC721 Registry token for User 1 in Chaingear, creates new Registry and sets User 1 as Registry administrator
    
    U1->>+CC: updateRegistryOwnership to=User2
    CC-->>R: transferTokenizedOnwerhip to=User2
    CC-->721: removeTokenFrom User1
    CC-->-721: addTokenTo User2
    Note over 721, R: Chaingear transfers token from User 1 to User 2 and also as owner of Registry sets User 2 as administrator
    
    U2->>+CC: registryInfo ID=0
    CC-->>-U2: returns Registry metainfromation
    
    U2->>+R: updateEntryCreationFee
    Note over U2, R: User 2 as admin now may set fees for entry creation in Registry
    
    U2->>+CC: unregisterRegistry ID=0
    CC-->>R: transferOwnership to=User2
    CC-->>-721: burn ID=0
    Note over 721, U2: User unregisters registry from chaingear and burns their token and getting after that owner control to Registry contract. Chaingear only deletes associated structure, burns token and transfers ownership.
```
