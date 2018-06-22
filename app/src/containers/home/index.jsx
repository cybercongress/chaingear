import React, { Component } from 'react';

import { Link } from 'react-router';

var moment = require('moment');

import * as cyber from '../../utils/cyber'
import { Paper, Title, Badge, FooterButton } from '../../components/chaingear/'
import { Table } from '../../components/Table/';
import { Container, Text, Link as ActionLink } from '../../components/CallToAction/';

const dateFormat = 'DD/MM/YYYY mm:hh';

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
                    <td>
                        ????
                    </td>
                    <td>
                        {register.creator}
                    </td>
                    <td>
                        {moment(new Date(register.registrationTimestamp.toNumber() * 1000)).format(dateFormat)}
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
                    <td>
                        ????
                    </td>
                    <td>
                        {register.creator}
                    </td>
                    <td>
                        {moment(new Date(register.registrationTimestamp.toNumber() * 1000)).format(dateFormat)}
                    </td>
                </tr>
          ))

    let content = (
        <div>
        <Title>My registries<Badge>{myRows.length}</Badge></Title>
        <Paper>
          <Container>
              <Text>You haven`t created registers yet!</Text>
              <ActionLink to='/new'>create</ActionLink>
          </Container>
        </Paper>
        </div>
    );

    if (myRows.length > 0 ){
        content = (
            <div>
                <Title>My registries<Badge>{myRows.length}</Badge></Title>
                <Paper>
                <Table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Symbol</th>
                            <th>Creator</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myRows}
                    </tbody>
                </Table>
                  <FooterButton to='/new'>create new register</FooterButton>
                </Paper>
            </div>
        )        
    }

    return (
      <div>
        <div>
            {content}
        </div>

        <Title>All registries<Badge>{rows.length}</Badge></Title>
        <Paper>
        <Table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Symbol</th>
                    <th>Creator</th>
                    <th>Created</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </Table>
        </Paper>
      </div>
    );
  }
}


export default Home;
