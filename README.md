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
icon = "ethereum.png" # optional. If empty default picture for a type

[crowdsales]
start_date = "22/7/2014" # type: date
end_date = "2/9/2014" # type: date
genesis_address = "36PrZ1KHYMpqSyAQXSG8VwbUiq2EogxLo2" # type: string
funding_tems = "https://www.ethereum.org/pdf/TermsAndConditionsOfTheEthereumGenesisSale.pdf" # type: string
funding_operator = "null" # type: string
funding_url = "https://www.ethereum.org/ether" # type: string
tokens_sold = 60102216 # type: number

[rating]
rating_cyber = 5 # type: number
ranking_cyber = 25 # type: number
ranking_coinmarketcap = "NaN" # type: number
rating_coingecko = "NaN" # type: number

```

## Bitcoin Case
```
blockchain_id = "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f"
name = "Bitcoin"

[specs]
dependencies = "independent"
consensusType = "Proof-of-Work"
consensusName = "Bitcoin Proof-of-Work"
rpc = 8332.0
blockTime = "600"
reward = "50"
halfingCycle = "210240"
total = "21000000"
difficultyCycle = "2016"
txsConfirm = "6"
algo = "SHA-256d"

[other}
ann = "http://article.gmane.org/gmane.comp.encryption.general/12588/"
status = "Running"
genesis = "03/01/2009"
announce = "31/10/2008"
type = "DAO"
rating = 5.0
hashtag = "#bitcoin"

[aliases]
coinMarketCap = "Bitcoin"
currencyName = "Bitcoin"
symbol = "BTC"

[[links]]
name = "web site"
url = "http://bitcoin.org/en/"
icon = "website.png"
tags = ["Main", "Apps"]

[[links]]
name = "github"
url = "https://github.com/bitcoin/bitcoin"
icon = "github.png"
tags = ["Main", "Code"]

[[links]]
name = "Documentation"
url = "https://bitcoin.org/bitcoin.pdf"
icon = "whitepaper.png"
tags = ["Main", "Science"]

[[links]]
name = "explorer"
url = "https://blockchain.info/"
icon = "explorer.png"
tags = ["Main", "Apps"]

[[links]]
name = "twitter"
url = "https://twitter.com/Bitcoin"
icon = "twitter.png"
tags = ["Main", "Apps"]

[[links]]
name = "forum"
url = "https://bitcointalk.org/"
icon = "forum.png"
tags = ["Apps"]

[[links]]
name = "blog"
url = "https://blog.bitcoinfoundation.org/"
icon = "blog.png"
tags = ["Apps"]

[[links]]
name = "reddit"
url = "http://www.reddit.com/r/Bitcoin/"
icon = "reddit.png"
tags = ["Apps"]
```


Link types:
 - website
 - github
 - paper
 - wiki
 - explorer
 - twitter
 - reddit
 - blog
 - forum
 - wallet
