import React, {Component} from 'react';

import {checkNetwork, getNetworkStr} from '../../utils/cyber';

import './App.scss';

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
        checkNetwork().then(({isCorrectNetwork, networkId, contractNetworks}) => {
            this.setState({
                isCorrectNetwork,
                networkId,
                contractNetworks,
            });
        });
    }

    render() {
        const {isCorrectNetwork, networkId, contractNetworks} = this.state;

        if (!isCorrectNetwork) {
            return (
                <div className='incorrectNetwork'>
                    <img src={require('./error.svg')}/>
                    <h2>Please change network.</h2>
                    <p>Current networkId: <span>{getNetworkStr(networkId)}</span></p>
                    <p>Contract networks:
                        <span>
                            {contractNetworks.map(netId => getNetworkStr(netId)).join(', ')}
                        </span>
                    </p>
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
