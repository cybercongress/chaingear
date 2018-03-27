Frontend (stateless web UI) for cyber-markets and cyber-search (blockchain browser).

[![CircleCI](https://img.shields.io/circleci/project/github/cyberFund/cyber-browser.svg)](https://circleci.com/gh/cyberFund/cyber-browser)

### Development

    npm install yarm -g if not installed

    npm start

This starts local server that compiles all UI assets into memory and
updates them as soon as they are edited.

UI uses API endpoints, specified by the following environment variables:

* [cyber-search](https://github.com/cyberFund/cyber-search) `CYBER_SEARCH_API`
* [cyber-markets](https://github.com/cyberFund/cyber-markets) `CYBER_SEARCH_API`
* [chaingear](https://github.com/cyberFund//chaingear-api) `CYBER_CHAINGEAR_API`

#### Building raw static site

    npm run build

This compiles all UI assets into static website, copied in `dist/`dir.
API endpoints are configured in [config.js](https://github.com/cyberFund/cyber-ui/blob/master/config.js).

#### Building container for deployment

    docker build -t cybernode/cui-browser -f ./devops/Dockerfile ./
    
To check that container works correctly, bring up backend API, pass
their endpoint URLs as environment variables and run container:
    
    export CYBER_CHAINGEAR_API=http://127.0.0.1:32600
    export CYBER_SEARCH_API=http://127.0.0.1:32700
    export CYBER_MARKETS_API=http://127.0.0.1:32800
    
    docker run -e CYBER_CHAINGEAR_API -e CYBER_SEARCH_API -e CYBER_MARKETS_API --name frontend -d -p 127.0.0.1:32500:80 cybernode/cui-browser

This command starts server on http://127.0.0.1:32500

Checking container logs:

    docker logs frontend

To attach to container and/or remove it if needed:

    docker exec -t -i frontend /bin/bash
    docker stop frontend
    docker rm frontend

### Cybernode settings

* **Image**: `cui-browser`
* **Portmap**: 32500

### Roadmap

* https://github.com/facebook/jest
* https://github.com/zeit/next.js/

