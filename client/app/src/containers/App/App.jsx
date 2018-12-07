import React, { Component } from 'react';

import { checkNetwork, getNetworkStr } from '../../utils/cyber';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isCorrectNetwork: false,
            networkId: null,
            contractNetworks: [],
        };
    }

    componentDidMount() {
        checkNetwork().then(({ isCorrectNetwork, networkId, contractNetworks }) => {
            this.setState({
                isCorrectNetwork,
                networkId,
                contractNetworks,
            });
        });
    }

    render() {
        const { isCorrectNetwork, networkId, contractNetworks } = this.state;

        if (!isCorrectNetwork) {
            return (
                <div>
                    <div>Change network.</div>
                    <div>
                        <span>Current networkId:</span>
                        {getNetworkStr(networkId)}
                    </div>
                    <div>
                        <span>Contract networks:</span>
                        <span>
                            {' '}
                            {contractNetworks.map(netId => getNetworkStr(netId)).join(', ')}
                            {' '}
                        </span>
                    </div>
                </div>
            );
        }

        return (
            <div>
                {this.props.children}
            </div>
        );
    }
}


export default App;
