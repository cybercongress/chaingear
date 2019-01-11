import React, { Component } from 'react';
import { Provider } from 'unstated';
import { MainContainer, Section } from '@cybercongress/ui';
import Records from './Records';
import Popups from './Popups';
import Header from './Header';
import General from './General';
import Overview from './Overview';
import Beneficiaries from './Beneficiaries';
import PageLoading from './PageLoading';
import page from './page';

class Database extends Component {
    componentDidMount() {
        const { dbsymbol } = this.props.params;

        page.init(dbsymbol);
    }

    render() {
        return (
            <Provider>

                <PageLoading />
                <Popups />

                <MainContainer>

                    <Header />

                    <General />

                    <Section>
                        <Overview />

                        <Beneficiaries />
                    </Section>

                    <Records />
                </MainContainer>
            </Provider>
        );
    }
}

export default Database;
