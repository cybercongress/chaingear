# Chaingear

This repository try to solve the problem of blockchains and tokens metadata.
If you are blockchain developer you can easily enrich metadata of your blockchain or token.

It will make significantly easier to deal with your token for any wallet, exchange, bridge and any web app which want to work with your blockchain or token.

This repository accumulate the following blockchains metadata:
- Dependencies
- Specs
- Logos
- Icons
- Links
- Events

## Add new

Why I need to add the blockchain?

1. Describe what it is for in understandable format.
2. Your chain on cyber•Fund for free.
3. Make your chain accessible for other developers.

## Improve metadata
You can add blockchain related projects in blockchain metadata.


## How to add?
Any system that follow basic digital property requirements could be added.
This is closed list of such requirements:
For every class of a system there are different requirements and mandatory data structure.


# How to add crowdsale?
Crowdsale consist of 2 steps:
- Before the start. We recommend to add this information at least a month before ETA.
- After the finish. We recommend to add this information in an hour after finish.

## Basic Due Diligence
We don't accept crowdfunding if certain condition didn't met:

- At least one genesis address exist. We don't accept crowdfunding if investors could not transparently track funds.
- Fund management is at least under 2 of 3 multisig. Fund managers could be anonymous, but some reputation inside community is highly recommended. Otherwise, well written paper or POC code eliminates any questions.
- Funding terms are defined and cryptographically signed by fund managers.
To add crowdfunding put this data to toml file of your system.

## Before
```toml
[crowdsale_start]
start_date = "2015-03-31T00:00:00"
end_date = "2015-05-15T00:00:00"
genesis_address = "35gLt5EgB367enjSjyEDahhWWcy6p1MGf6"
funding_url = "https://koinify.com/#/project/FACTOM"
funding_tems = "http://blog.factom.org/post/115139137794/the-factoid-software-sale-is-live"
min_investment = 0.01
funding_operator = "Koinify" # Could be `nein`.
crowsale_feed = "http://example.com/feed" # For multi currency or non bitcoin crowdsale
```
Note that all fields are mandatory.

## After
Then crowdsale is finished two liner report is needed.
```toml
[crowdsale_closed]
tokens_sold = 4379973
tokens_issued = 8759946
```

## Cap Calculation
After end of crowdsale your cap will be calculated automatically based on two fields: `min_invesment` and `genesis_address`. Thus your project will become visible in [Rating](https://cyber.fund) with fixed cap until tokens (1) won't be distributed and (2) at least one public market will be established.
You can provide multiple addresses as array: `["address1", "address2"]`.
At this point of time we support only Bitcoin addresses for crowdsale calculations. For multi currency crowdsale or non bitcoin crowdsale you will need to provide pre calculated feed:


# Independent System
If the independent system don't meet this criteria underlying token should not be treated as digital property and could not be included in Chaingear as Independent System.

For every system you need to create a folder with exact name of a system. A name should be unique. If there exist system with name in respect to communities please invent another name. In case of historical collisions (Bytecoin for instance) priority will have a system with older genesis date. Newer system will be excluded until renamed.

Inside this folder you should put a logo. Logo is mandatory. Logo requirements:
- file should be .png
- background should be transparent
- file name should be exact of system name
- image should be square
- image should have resolution between 256x256 and 1024x1024

## Independent system
```toml
# This is a TOML document.

[document]
system = "Ethereum" # type: string
genesis_id = "null" # type: string

# Descriptive data
[descriptions]
symbol = "ETH" # type: string
currency = "ether" # type: string
short_description = "A Next-Generation Smart Contract and Decentralized Application Platform" # type: string
summary = "Ethereum is a community-driven project aiming to decentralize the internet and return it to its democratic roots. It is a platform for building and running applications which do not need to rely on trust and cannot be controlled by any central authority." # type: string
coinmarketcap = "Ethereum" # type: string

type = "DAO" # type: string
consensus = "Ethereum" # type: string

[dependencies] # type: string. Independent if empty.

[links]
name = "web site" # type: string
url = "http://ethereum.org/" # type: string
type = "website" # type: string
tags = [ "Main", "Apps" ] # type: string
icon = "ethereum.png" # optional. If empty default picture for a type

[crowdsales]
start_date = "22/7/2014" # type: date
end_date = "2/9/2014" # type: date
genesis_address = "36PrZ1KHYMpqSyAQXSG8VwbUiq2EogxLo2" # type: string
funding_tems = "https://www.ethereum.org/pdf/TermsAndConditionsOfTheEthereumGenesisSale.pdf" # type: string
funding_operator = "null" # type: string
funding_url = "https://www.ethereum.org/ether" # type: string
tokens_sold = 60102216 # type: number

[ratings]
rating_cyber = 5 # temporary. type: number

```

## Bitcoin Case
```
genesis_id = "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f"
system = "Bitcoin"

[token]
token_name="bitcoin"
token_symbol = "BTC"

[dependencies]
# If epmty - "independent"

[descriptions] # mapped as strings
headline = "Bitcoin is an innovative payment network and a new kind of money" # type: string
description = "Bitcoin is an innovative payment network and a new kind of money." # type: string
system_type = "blockchain"
state = "live"
hashtag = "#bitcoin"
tags = ["whale", "dao"]

[aliases] # used for matching
coinmarketcap = "Bitcoin"

[consensus]
consensus_type = "Proof-of-Work"
consensus_name = "Bitcoin Proof-of-Work"
hashing = "SHA-256d"

[specs] # mapped as number
rpc = 8332 # RPC port
p2p = null # p2p port
block_time = 600 # the number of seconds required for generating a block
block_reward = 50 # the number of tokens received as a reward for the found block
halfing_cycle = 210240
difficulty_cycle = 2016
txs_confirm = 6 # the number of confirmations required to record transactions in the block
mint_confirm = 120
total_tokens = 21000000 # the number of tokens that will ever be generated
premine_tokens = 0 # the number of premined tokens

[events] # mapped as dates
announcement = "31/10/2008"
genesis = "03/01/2009"

[ratings]
rating_cyber = 5 # temporary. type: number

# Standard links. Automatic icons

[links]
url = "http://ethereum.org/" # type: string
type = "website" # type: string
tags = [ "Main", "Apps" ] # type: string
name = "website" # optional. If empty - name of type. type: string

Supported for link types:
 - website [ "Main", "Apps" ]
 - paper [ "Main", "Apps" ]
 - wallet [ "Main", "Apps" ]
 - explorer [ "Main", "Apps" ]
 - wiki [ "Apps" ]
 - github [ "Apps" ]
 - twitter [ "Apps" ]
 - reddit [ "Apps" ]
 - blog [ "Apps" ]
 - forum [ "Apps" ]

# Custom links
[links]
name = "web site" # type: string
url = "http://ethereum.org/" # type: string
type = "custom" # type: string
tags = [ "Main", "Apps" ] # type: string
icon = "bitcoin.png" # optional. If empty default picture for a type

```
