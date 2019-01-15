import React, { Component } from 'react';

import { Link } from 'react-router';

import {
    Section,
    SectionContent,
    Badge, FooterButton,
    Container, Text, ActionLink,
    HomeTable,
    LinkHash,
} from '@cybercongress/ui';

import {
    getDatabases, getDefaultAccount, init,
} from '../../utils/cyber';
import { formatDate } from '../../utils/utils';

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            databases: [],
            account: null,
        };
    }

    componentDidMount() {
        init()
            .then(() => getDefaultAccount())
            .then(account => this.setState({
                account: account.toLowerCase(),
            }))
            .then(() => getDatabases())
            .then(databases => this.setState({
                databases,
            }));
    }

    render() {
        const { databases, account } = this.state;

        const rows = databases.map(database => (
            <tr key={ database.name }>
                <td>
                    <Link to={ `/databases/${database.symbol}` }>
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
                    {formatDate(database.createdTimestamp)}
                </td>
            </tr>
        ));

        const myRows = databases.filter(x => x.admin === account).map(database => (
            <tr key={ database.name }>
                <td>
                    <Link to={ `/databases/${database.symbol}` }>
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
                    {formatDate(database.createdTimestamp)}
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
                            <HomeTable>
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
                            </HomeTable>
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
                        <HomeTable>
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
                        </HomeTable>
                    </SectionContent>
                </Section>
            </div>
        );
    }
}


export default Home;
