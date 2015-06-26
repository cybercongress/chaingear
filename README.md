# Chaingear

This repository try to solve the problem of blockchains and tokens metadata.
If you are blockchain developer you can easily enrich metadata of your blockchain or token.

It will make significantly easier to deal with your token for any wallet, exchange, bridge and any web app which want to work with your blockchain or token.

This repository accumulate the following blockchains metadata:
- Parameters
- Dependancies
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

## Ethereum case
```toml
# This is a TOML document.

[document]
system = "Ethereum" # type: string
blockchain_id = "null" # type: string

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

[consensus]
consensus_type = "Proof-of-Work"
consensus_name = "Bitcoin Proof-of-Work"
hashing = "SHA-256d"

[dependencies]
# If epmty - "independent"

[descriptions] # mapped as strings
state = "live"
type = "blockchain"
hashtag = "#bitcoin"
headline = "Bitcoin is an innovative payment network and a new kind of money" # type: string
tags = ["whale", "dao"]
description = "Bitcoin is an innovative payment network and a new kind of money." # type: string

[aliases] # used for matching
coinmarketcap = "Bitcoin"

[specs] # mapped as number
rpc = "8332"
blockTime = "600"
reward = "50"
halfingCycle = "210240"
total = "21000000"
difficultyCycle = "2016"
txsConfirm = "6"

[events] # mapped as dates
announcement = "31/10/2008"
genesis = "03/01/2009"

[ratings]
rating_cyber = 5 # temporary. type: number

# Standard links. Automatic icons

[links]
url = "http://ethereum.org/" # type: string
type = "website" # type: string
tags = [ "Main", "Apps" ] # optional. If empty - standardtype. type: string
name = "website" # optional. If empty - name of type. type: string

Supported fo link types:
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
