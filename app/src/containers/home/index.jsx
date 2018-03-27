import React, { Component } from 'react';

import { Link } from 'react-router';

import * as chaingear from '../../utils/chaingear'

class Home extends Component {
    constructor(props) {
      super(props)

      this.state = {
        registers: []
      }
    }

    componentDidMount() {
      chaingear.getContracts().then(registers => {
        this.setState({
        registers
      })
      })
    }

  render() {
    const { registers } = this.state;
    return (
      <div>
        <h2>Existing registers:</h2>
        <ul >
          {registers.map(register => (
                <li key={register.name}>
                  {
                    register.status === 'pending' ? (
                      <span>
                        <span>{register.name}</span>
                        (<Link to={`/wait/${register.txHash}`}>pending</Link>)
                      </span>
                    ) : (
                      <Link 
                        to={`/registers/${register.address}`} 
                      >{register.name}</Link>
                    )
                  }
                </li>
          ))}
          </ul>
          <Link to='/new'>create new register</Link>
      </div>
    );
  }
}


export default Home;
