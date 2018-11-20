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



import { getRegistries, getDefaultAccount, formatDate } from '../../utils/cyber';


class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            registries: [],
            account: null,
        };
    }

    componentDidMount() {
        getRegistries().then(registries => this.setState({
            registries,
        }));

        getDefaultAccount().then(account => this.setState({
            account,
        }));
    }

    render() {
        const { registries, account } = this.state;


        const rows = registries.map(register => (
            <tr key={ register.name }>
                <td>
                    <Link to={ `/registers/${register.address}` }>
                        {register.name}
                    </Link>
                </td>
                <td>
                    {register.symbol}
                </td>
                <td>
                    {register.supply.toNumber()}
                </td>
                <td>
                    {register.contractVersion}
                </td>
                <td>
                    <LinkHash value={ register.admin } />
                </td>
                <td>
                    {formatDate(register.registrationTimestamp)}
                </td>
            </tr>
        ));

        const myRows = registries.filter(x => x.admin === account).map(register => (
            <tr key={ register.name }>
                <td>
                    <Link to={ `/registers/${register.address}` }>
                        {register.name}
                    </Link>
                </td>
                <td>
                    {register.symbol}
                </td>
                <td>
                    {register.supply.toNumber()}
                </td>
                <td>
                    {register.contractVersion}
                </td>
                <td>
                    <LinkHash value={ register.admin } />
                </td>
                <td>
                    {formatDate(register.registrationTimestamp)}
                </td>
            </tr>
        ));

        let content = (
            <div>
                <Section title={ (
                    <span>
                        <span>My registries</span>
                        <Badge>{myRows.length}</Badge>
                    </span>
                ) }
                >
                    <SectionContent>
                        <Container>
                            <Text>You haven&#39;t created registries yet!</Text>
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
My registries
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
                            <FooterButton to='/new'>create new registry</FooterButton>
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
                        <span>chaingear registries</span>
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
