import React, { Component } from 'react';

import { Link } from 'react-router';

var moment = require('moment');

import * as cyber from '../../utils/cyber'
import { Paper, Title, Badge, FooterButton } from '../../components/chaingear/'
import { Table } from '../../components/Table/';
import { Container, Text, Link as ActionLink } from '../../components/CallToAction/';

const dateFormat = 'DD/MM/YYYY mm:hh';

import { 

    Section,
    SectionContent,

} from '../../components/chaingear/'

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
        <Section title={<span>My registries<Badge>{myRows.length}</Badge></span>}>
            <SectionContent>
          <Container>
              <Text>You haven`t created registers yet!</Text>
              <ActionLink to='/new'>create</ActionLink>
          </Container>
        </SectionContent>
        </Section>
        </div>
    );

    if (myRows.length > 0 ){
        content = (
            <div>
                <Section title={<span>My registries<Badge>{myRows.length}</Badge></span>}>
                <SectionContent>
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
                  </SectionContent>
                </Section>
            </div>
        )        
    }

    return (
      <div>
        <div>
            {content}
        </div>

        <Section title={<span>All registries<Badge>{rows.length}</Badge></span>}>
        <SectionContent>
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
        </SectionContent>
        </Section>
      </div>
    );
  }
}


export default Home;
