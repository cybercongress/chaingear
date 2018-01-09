# Chaingear

[![Travis CI](https://img.shields.io/travis/cyberFund/chaingear/master.svg)](https://travis-ci.org/cyberFund/chaingear/builds)

[![Join the chat at https://gitter.im/cyberFund/chaingear](https://badges.gitter.im/cyberFund/chaingear.svg)](https://gitter.im/cyberFund/chaingear?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Verified and machine readable blockchain metadata.
![chaingear](http://cybertalks.org/uploads/default/original/1X/7513bd73105f7748b8e582a07a7441d28f584070.jpg)
If you are blockchain developer you can easily enrich metadata of system you are building.

Trying to solve the problem of cryptocurrencies and cryptoassets metadata, this repository accumulate dependencies, specs, logos, links and other sensitive metadata.

Rationale behind Chaingear you can find in a paper: [cyber•Rating: Cryptoproperty Evaluation](https://github.com/cyberFund/cyberrating.org/blob/master/paper.md#8-cryptoproperty-identification).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents

- [API](#api)
- [What benefits of adding to Chaingear?](#what-benefits-of-adding-to-chaingear)
- [How to add a system?](#how-to-add-a-system)
  - [Steps to add system in Chaingear](#steps-to-add-system-in-chaingear)
  - [Requirements](#requirements)
  - [What is cryptoproperty compliance?](#what-is-cryptoproperty-compliance)
  - [Cryptocurrency Listing:](#cryptocurrency-listing)
  - [Cryptoasset Listing:](#cryptoasset-listing)
  - [Cryptoproject Listing](#cryptoproject-listing)
  - [Cryptoservice Listing](#cryptoservice-listing)
  - [What if I have a private cryptocurrency or cryptoasset?](#what-if-i-have-a-private-cryptocurrency-or-cryptoasset)
  - [What if I don't have a token yet?](#what-if-i-dont-have-a-token-yet)
- [How to add a crowdsale?](#how-to-add-a-crowdsale)
  - [Basic Due Diligence](#basic-due-diligence)
  - [Before](#before)
  - [After](#after)
  - [Fixed Cap Calculation](#fixed-cap-calculation)
  - [Multi Currency Crowdsale](#multi-currency-crowdsale)
- [How to add my site?](#how-to-add-my-site)
- [Specification of .toml file](#specification-of-toml-file)
  - [Basic info](#basic-info)
  - [Specs](#specs)
  - [Events](#events)
  - [Links](#links)
  - [Aliases](#aliases)
  - [Ratings](#ratings)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## API
Link to stable version is not published yet:
[chaingear.cyber.fund/v1.json](chaingear.cyber.fund/v1.json)

Unstable version could be found here:
[chaingear.cyber.fund/chaingear.json](http://chaingear.cyber.fund/chaingear.json)

## What benefits of adding to Chaingear?

1. Make your system understandable for people.
All meaningful information about system you develop should be gathered in one place in order to gain more adaption.
2. Make your system accessible for other developers. It will make significantly easier to deal with your token for any wallet, exchange, bridge and any web app which want to work with your cryptocurrency or cryptoasset.
2. Your system is listed in cyber•Fund's Radar or Rating for free.
We are continuously working on attraction of investors to blockchain based projects.

## How to add a system?
We support 4 types of a systems:
- `cryptocurrency`
- `cryptoasset`
- `cryptoservice`
- `cyptoproject`

For every type data structure is quite similar, but requirements are differs.

Meta description is a simple text file in [`toml`](https://github.com/toml-lang/toml) format.
```toml
system = "Bitcoin"
icon = "bitcoin.png"
type = "cryptocurrency"
```

### Steps to add system in Chaingear
- Clone `chaingear` repository
- Run `npm install`
- Run `cg add {system type}`

```
 Now the process is not automated, so:
- Create a folder at `/chaingear/sourses`. Name of the folder should be same as a `system` name
- Copy desired type of a system from `/templates` into a folder you created
- Rename `example.toml` to a `system` name
```

- Fill out `.toml` file in accordance with [specs](#specification-of-.toml-file).
- Pull request

cyber•Fund's Team in short time will review and merge it.

### Requirements

Any system that follow basic digital property requirements could be added.
This is closed list of such requirements:
- We allow listing of cryptocurrencies and cryptoassets that are **cryptoproperty compliant**.
- We allow listing of publicly traded cryptocurrencies and cryptoassets.
- We allow listing of cryptocurrencies and cryptoassets based on crowdinvesting valuation with fixed cap until cryptocurrency or cryptoasset goes to market.

### What is cryptoproperty compliance?
We are going to publish a paper soon that explain a lot of stuff. But now the following requirements exist:

All systems regardless of the type should have:
- Website
- Community forum / Thread on specialized forum (like [Bitcointalk](https://bitcointalk.org))
- Public communication channel: Blog/Twitter/Reddit/Slack etc.  

### Cryptocurrency Listing:
- Should be established and uniquely identifiable via Genesis ID.
- Should have underlying internal capital - a cryptocurrency responsible for resilience of network consensus.
- Core code responsible for network consensus should be open source, buildable and executable for at least one open source operating system.
- Should have blockchain explorer wich can disclose information about: blocks, addresses, transactions, numbers of nodes/peers/witnesses

### Cryptoasset Listing:
- Should be registered using listed cryptocurrency and uniquely identifiable via Genesis ID.
- Registration protocol should be defined by a code (Counterparty, Omni, NXT AE, NXT Monetary System etc.) and/or natural language (protocol specification such as Open Assets protocol, AGS, etc.)
- Purpose of registration should be described by a code (e.g. smart contracts), and/or natural language (e.g. Ricardian contract or signed Shareholders agreement)

### Cryptoproject Listing
-

### Cryptoservice Listing

### What if I have a private cryptocurrency or cryptoasset?
No problem. It could be registered using Chaingear library and will be listed in Radar. So when your brainchild will be ready to be publicly traded it will be included in Rating automagicaly. Follow [cyber•Fund Radar](https://cyber.fund/radar) listing section.

### What if I don't have a token yet?
If you are not going to issue a token or create an independent system we could not add your

You can discuss or ask a question at [cyber•Talk Thread](http://cybertalks.org/t/rating-listing-of-cryptocurrencies-and-cryptoassets/353)

## How to add a crowdsale?
Crowdsale consist of 2 steps:
- Before the start. We recommend to add this information at least a month before ETA.
- After the finish. We recommend to add this information in an hour after finish.

### Basic Due Diligence
We don't accept crowdfunding if certain condition didn't met:

- At least one genesis address exist. We don't accept crowdfunding if investors could not transparently track funds.
- Fund management is at least under 2 of 3 multisig. Fund managers could be anonymous, but some reputation inside community is highly recommended. Otherwise, well written paper or POC code eliminates any questions.
- Funding terms are defined and cryptographically signed by fund managers.
To add crowdfunding put this data to toml file of your system.

### Before
```toml
[crowdsales]
start_date = "2015-03-31T00:00:00" or [ ["blockchain", "Ethereum"], ["block", "3798640"] ]
end_date = "2015-05-15T00:00:00"
genesis_address = ["35gLt5EgB367enjSjyEDahhWWcy6p1MGf6"] # Could be array. See multu currency crowdsale
funding_url = "https://koinify.com/#/project/FACTOM"
funding_terms = "http://blog.factom.org/post/115139137794/the-factoid-software-sale-is-live"
min_investment = 0.01
funding_operator = "Koinify" # Could be `nein`.
crowsale_feed = "http://example.com/feed" # For multi currency or non bitcoin crowdsale
```
Note that all fields are mandatory.

### After
Then crowdsale is finished two liner report is needed.
```toml
tokens_sold = 4379973
tokens_issued = 8759946
btc_raised = 3500
```

### Fixed Cap Calculation
After end of crowdsale your cap will be calculated automatically based on 4 fields: `start_date`, `end_date`, `min_invesment` and `genesis_address`. Thus your project will become visible in [Rating](https://cyber.fund) with fixed cap until tokens (1) won't be distributed and (2) at least one public market will be established.

### Multi Currency Crowdsale
You can provide multiple addresses as array: `["address1", "address2"]`.

> At this point of time we support only Bitcoin addresses for crowdsale calculations. For multi currency crowdsale or non bitcoin crowdsale you will need to provide pre calculated feed.

## How to add my site?
It is easy!
Follow [links](#links) section.

## Specification of .toml file

### Basic info
```toml
genesis_id = "hash_of_the_first_block"
system = "System Name"
icon = "system_name"
Should never be changed.
```

`genesis_id`
- Hash of the first block generated by System
- ID wich can define asset in the blockchain

`system` -  The unique name of a system. If there exist system with name in respect to communities please invent another name. In case of historical collisions (Bytecoin for instance) priority will have a system with older genesis date. Newer system will be excluded until renamed. Go to a `/chaingear/sourses` to explore systems names or type in a Search at [cyber.fund](https://cyber.fund/)

`dependencies` - Specify dependencies on other systems.
Names of the systems you can find in `/chaingear/sourses`
```
example
```

`icon` - The name of image of a system logotype (for example `icon` = `"bitcoin"`)

Put image file in to a `/chaingear/logos` folder.

Image requirements:
- file should be .png
- background should be transparent
- file name should be exact of system name ???
- image should be square
- image should have resolution between 256x256 and 1024x1024

### Specs

This section contains information about technical specification of the system.

```toml
[specs]
genesis_id = "hash_of_the_first_block"
dependencies = ["independent"]
name = "name"
symbol = "token_ticker"
consensus_type = "Consensus Type" # `Proof-of-Work`, `Proof-of-Stake`, `Delegated Proof-of-Stake`, `Hybrid POS-POW`, `Federated Consensus`, `Blockchain Ledger`
consensus_name = "Consensus Name"
hashing = "Encryption Name"
system_type = "Independent System"
state = "Running"
headline = "A brief description of not more than 140 symbols or tagline"
hashtag = "#example"
tags = ["DAO"]
page_state = "draft" # can be "draft" or "ready"
block_time = 600
block_reward = 50
halfing_cycle = 210240
total_tokens = 21000000
premine_tokens = 0
difficulty_cycle = "2016"
txs_confirm = 6
rpc = "8332"
```

`name` - The token name. Sometimes the system name and the name of the token is not the same, for example `SAFE Network` token has name `MaidSafeCoin`

`symbol` - Market ticker of the system (Bitcoin - `BTC`)

`system_type` - Choose a system type from a classification below:
- `cryptocurrency`
- `cryptoasset`
- `cryptoservice`
- `cyptoproject`

`state` - choose existing state of a system:
- *Project* - for systems that are in development or on idea stage. Systems with this state will be displayed at [cyber•Fund Radar](https://cyber.fund/radar) section
- *Private* -
- *Pre-Public* -
- *Public* -

`headline` - describe the system in a few words, not more than 140 symbols

`hashtag` - fill hashtag for a system

`tags` - you can specify any number of tags related to a system

`page_state` -
- *draft* - for systems that require additional information and links
- *ready* - for systems that already have full information

`block_time` - The number of seconds required for generating a block

`txs_confirm` - The number of confirmations required to record transaction in the blockchain

`block_reward` - The number of tokens received as a reward for the found block

`total_tokens` - The number of tokens that will ever be generated by a system

`premine_tokens` - The number of premined tokens

`halfing_cycle` - The number of blocks required to increase

`difficulty_cycle` - The number of blocks required to increase difficulty of calculation

`rpc` - The number of the RPC port

You can add any property that not defined in this specification.

### Events
```toml
[[events]]
name = "Event Name"
start_date = "2015-03-31T00:00:00"
end_date = "2015-03-31T00:00:00"
url = "http://event_link.com"
```

### Links
```toml
[[links]]
type = "website"
name = "Name of the site"
url = "http://example.com"
rss = "http://example.com/rss_feed"
icon = "website.png"
tags = ["Main","Apps"]
```

`type` -
For the standart types of links listed below, provides automatic detection of the `icons` and `tags`, so you do not need to fill out these properties.
Standard links types:
- *website* - tags: ["Main"], icon: fa-home
- *paper* - tags: ["Science"], icon: fa-graduation-cap
- *wallet* - tags: ["Apps","Wallet"], icon: fa-credit-card
- *explorer* - tags: ["Apps","Analytics"], icon: fa-search
- *wiki* - tags: ["Science"], icon: fa-wikipedia-w
- *github* - tags: ["Code"], icon: fa-github
- *bitbucket* - tags: ["Code"], icon: fa-bitbucket
- *blog* - tags: ["News"], icon: fa-pencil-square-o
- *forum* - tags: ["News"], icon: fa-comments-o
- *twitter* - tags: ["News"], icon: fa-twitter
- *reddit* - tags: ["News"], icon: fa-reddit
- *facebook* - tags: ["News"], icon: fa-facebook-official
- *google+* - tags: ["News"], icon: fa-google-plus-square
- *youtube* - tags: ["News"], icon: fa-youtube-square
- *Slack* - tags: ["News"], icon: fa-slack

For other links types use:
- *custom* - all properties you should define manualy

`name` - The name of the resource to which this link leads.

`url` - URL for this link

`rss` - URL of the RSS-feed for specified resource

`icon` - If not defined - default icon for a `type`. To customize icon for the link fill image name and put image file in to a `/chaingear/logos` folder. Image requirements are the same as for the system logo

`tags` - Tags define in which section of the cyber•Fund System's Profile Page  will be plaeced:
- *Main* - section below Logotype, Name of the System and Raiting. Can contain only 4 links
- *News* - this tag places link Section: News
- *Apps* - by default this tag places link in the Section: Apps/Other
- *Wallet* - in combination with *Apps* tag places link in the Section: Apps/Wallets, use for wallets and clients
- *Exchange* - in combination with *Apps* tag places link in the Section: Apps/Exchanges, use for exchanges
- *Analytics* - in combination with *Apps* tag places link in the Section: Apps/Analytics, use for any analytics resources
- *Code* - Section: Developers Dimension
- *Science* - Section: Scientific Roots
- Also you can add any other tag

### Aliases
Serve as a way to resolve different name from different data sources or

```toml
coinmarketcap = "Bitcoin"
nickname = "Bitcoin"
```

### Сrutches
Obsolete. Will be eventually moved to [cyberfund/cybertaing](https://github.com/cyberFund/cyberrating)
```toml
[ratings]
rating_cyber = 0
[flags]
supply_from_here = true
rating_do_not_display = true
```
