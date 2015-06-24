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

## Target example
```toml
# This is a TOML document.

[document]
timestamp = 1431342962 # type: date
source = "CoinMarketCap" # _type: string
id = "_id" # _type: string
system = "Ethereum" # type: string
blockchain_id = "null" # type: string

# Descriptive data
[descriptions]
symbol = "ETH" # type: string
currency = "ether" # type: string
short_description = "A Next-Generation Smart Contract and Decentralized Application Platform" # type: string
"summary" = "Ethereum is a community-driven project aiming to decentralize the internet and return it to its democratic roots. It is a platform for building and running applications which do not need to rely on trust and cannot be controlled by any central authority." # type: string

type = "DAO" # type: string
consensus = "Ethereum" # type: string

# Discrete Data
[dependencies] # type: string. Independent if empty.

[aliases"]
CoinMarketCap = "Ethereum" # type: string

[links]
name = "web site" # type: string
url = "http://ethereum.org/" # type: string
type = "website" # type: string
tags = [ "Main", "Apps" ] # type: string

[crowdsales]
start_date = "22/7/2014" # type: date
end_date = "2/9/2014" # type: date
genesis_address = "36PrZ1KHYMpqSyAQXSG8VwbUiq2EogxLo2" # type: string
funding_tems = "https://www.ethereum.org/pdf/TermsAndConditionsOfTheEthereumGenesisSale.pdf" # type: string
funding_operator = "null" # type: string
funding_url = "https://www.ethereum.org/ether" # type: string
tokens_sold = 60102216 # type: number

# Continious data
[supply]
supply_current = 60102216 # type: number
supply_max = 45000000 # type: number

[cap]
cap_usd = 18439000 # type: number
cap_btc = 31529 # type: number

[price]
price_usd = 1.34 # type: number
price_btc = 0.05 # type: number

[rating]
rating_cyber = 5 # type: number
ranking_cyber = 25 # type: number
ranking_coinmarketcap = "NaN" # type: number
rating_coingecko = "NaN" # type: number

```
