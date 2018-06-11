import React, { Component } from 'react';

import { Link } from 'react-router';

var moment = require('moment');

import * as cyber from '../../utils/cyber'

class Home extends Component {
    constructor(props) {
      super(props)

      this.state = {
        registries: [],
        account: null
      }
    }

    componentDidMount() {
      cyber.getRegistry().then(({ items, accounts }) => {
        this.setState({
        registries: items,
        account: accounts[0]
      })
      })
    }

  render() {
    const { registries, account } = this.state;
    console.log(registries);

    const rows = registries.map(register => (
                <tr key={register.name}>
                    <td>
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
                    </td>
                        ????
                    <td>
                    </td>
                    <td>
                        {register.creator}
                    </td>
                    <td>
                        {moment(new Date(register.registrationTimestamp.toNumber() * 1000)).format('DD-MM-YYYY')}
                    </td>
                </tr>
          ));

    const myRows = registries.filter(x => x.creator === account).map(register => (
                <tr key={register.name}>
                    <td>
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
                    </td>
                        ????
                    <td>
                    </td>
                    <td>
                        {register.creator}
                    </td>
                    <td>
                        {moment(new Date(register.registrationTimestamp.toNumber() * 1000)).format('DD-MM-YYYY')}
                    </td>
                </tr>
          ))

    let content = (
        <div>
            <Link to='/new'>create new register</Link>
        </div>
    );

    if (myRows.length > 0 ){
        content = (
            <div>
                <h2>My registries:</h2>
                <table>
                    <thead>
                        <tr>
                            <th>name</th>
                            <th>symbol</th>
                            <th>owner</th>
                            <th>created date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myRows}
                    </tbody>
                </table>
                  <Link to='/new'>create new register</Link>
            </div>
        )        
    }

    return (
      <div>
        <div>
            {content}
        </div>

        <h2>Existing registries:</h2>
        <table>
            <thead>
                <tr>
                    <th>name</th>
                    <th>symbol</th>
                    <th>owner</th>
                    <th>created date</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
      </div>
    );
  }
}


export default Home;
