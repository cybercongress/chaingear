import React, { Component } from 'react';
import { Provider } from 'unstated';
import {
    MainContainer, Section, ScrollContainer, Pane,
} from '@cybercongress/ui';
import Records from './Records';
import DatabasePopups from './DatabasePopups';
import RecordPopups from './RecordPopups';
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
                {/* <DatabasePopups />
                <RecordPopups /> */}
                 <DatabasePopups />
                <ScrollContainer>
                    <MainContainer>
                        <Header />

                        <General />

                        <Section marginTop='-1em'>
                            <Pane
                              display='grid'
                              gridTemplateColumns='3.2fr 1fr'
                              width='100%'
                              gridGap='15px'
                            >
                                <Overview />

                                <Beneficiaries />
                            </Pane>
                        </Section>

                        <Records />
                    </MainContainer>
                </ScrollContainer>
            </Provider>
        );
    }
}

export default Database;
