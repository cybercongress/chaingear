import React, { Component } from 'react';

import { Link } from 'react-router';

import {
    Section,
    SectionContent,
    Badge, FooterButton,
    Container, Text, ActionLink,
    Table,
    LinkHash,
} from '@cybercongress/ui';



import { getDatabases, getDefaultAccount, formatDate } from '../../utils/cyber';


class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            databases: [],
            account: null,
        };
    }

    componentDidMount() {
        getDatabases().then(databases => this.setState({
            databases,
        }));

        getDefaultAccount().then(account => {
            this.setState({
                account: account.toLowerCase(),
            });
        });
    }

    render() {
        const { databases, account } = this.state;

        const rows = databases.map(database => (
            <tr key={ database.name }>
                <td>
                    <Link to={ `/databases/${database.id}` }>
                        {database.name}
                    </Link>
                </td>
                <td>
                    {database.symbol}
                </td>
                <td>
                    {database.supply.toNumber()}
                </td>
                <td>
                    {database.contractVersion}
                </td>
                <td>
                    <LinkHash value={ database.admin } />
                </td>
                <td>
                    {formatDate(database.registrationTimestamp)}
                </td>
            </tr>
        ));

        const myRows = databases.filter(x => x.admin === account).map(database => (
            <tr key={ database.name }>
                <td>
                    <Link to={ `/databases/${database.id}` }>
                        {database.name}
                    </Link>
                </td>
                <td>
                    {database.symbol}
                </td>
                <td>
                    {database.supply.toNumber()}
                </td>
                <td>
                    {database.contractVersion}
                </td>
                <td>
                    <LinkHash value={ database.admin } />
                </td>
                <td>
                    {formatDate(database.registrationTimestamp)}
                </td>
            </tr>
        ));

        let content = (
            <div>
                <Section title={ (
                    <span>
                        <span>My databases</span>
                        <Badge>{myRows.length}</Badge>
                    </span>
                ) }
                >
                    <SectionContent>
                        <Container>
                            <Text>You haven&#39;t created databases yet!</Text>
                            <ActionLink to='/new'>create and deploy right now</ActionLink>
                        </Container>
                    </SectionContent>
                </Section>
            </div>
        );

        if (myRows.length > 0) {
            content = (
                <div>
                    <Section title={ (
                        <span>
My databases
                            <Badge>{myRows.length}</Badge>
                        </span>
                    ) }
                    >
                        <SectionContent>
                            <Table>
                                <thead>
                                    <tr>
                                        <th>NAME</th>
                                        <th>SYMBOL</th>
                                        <th>ENTRIES</th>
                                        <th>VERSION</th>
                                        <th>ADMIN</th>
                                        <th>CREATED</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myRows}
                                </tbody>
                            </Table>
                            <FooterButton to='/new'>create new database</FooterButton>
                        </SectionContent>
                    </Section>
                </div>
            );
        }

        return (
            <div>
                <div>
                    {content}
                </div>

                <Section title={ (
                    <span>
                        <span>chaingear databases</span>
                        <Badge>{rows.length}</Badge>
                    </span>
                ) }
                >
                    <SectionContent>
                        <Table>
                            <thead>
                                <tr>
                                    <th>NAME</th>
                                    <th>SYMBOL</th>
                                    <th>ENTRIES</th>
                                    <th>VERSION</th>
                                    <th>ADMIN</th>
                                    <th>CREATED</th>
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
