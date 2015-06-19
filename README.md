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
name = "Ethereum"
blockchain_id = null
dependencies = independent

[descriptions]
symbol = "ETH"
currency = "ether"
short_description = "A Next-Generation Smart Contract and Decentralized Application Platform",
"summary": "Ethereum is a community-driven project aiming to decentralize the internet and return it to its democratic roots. It is a platform for building and running applications which do not need to rely on trust and cannot be controlled by any central authority."
type = "DAO"
consensus: "Ethereum"

[links]
name: "web site",
url: "http://ethereum.org/",
type: "website",
tags: [ "Main", "Apps" ]

[metrics]
cyber_rating = 5
supply = 60102216,
timestamp = 1431342962

  [metrics.cap]
  usd = 18439000,
  btc = 31529

[aliases"]
CoinMarketCap = "Ethereum"

[crowdsales]
start_date = "22/7/2014"
end_date = "2/9/2014"
genesis_address = "36PrZ1KHYMpqSyAQXSG8VwbUiq2EogxLo2",
funding_tems = "https://www.ethereum.org/pdf/TermsAndConditionsOfTheEthereumGenesisSale.pdf",
funding_operator = null,
funding_url = "https://www.ethereum.org/ether",
tokens_sold = 60102216
```
