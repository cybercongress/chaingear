import React from 'react';
import { Subscribe } from 'unstated';
import {
    LinkHash, Section, SectionContent,
    FundContainer, BoxTitle, CentredPanel,
} from '@cybercongress/ui';
import page from './page';

const moment = require('moment');

const General = () => (
    <Subscribe to={ [page] }>
        {(dbPage) => {
            const {
                createdTimestamp,
                admin,
                totalFee,
                funded,
            } = dbPage.state;

            return (
                <Section title='General'>
                    <SectionContent style={ { width: '25%' } }>
                        <CentredPanel>
                            <BoxTitle>Created:</BoxTitle>
                            <div>
                                {createdTimestamp ? moment(new Date(createdTimestamp.toNumber() * 1000)).format('DD/MM/YYYY hh:mm:ss') : ''}
                            </div>
                        </CentredPanel>
                    </SectionContent>

                    <SectionContent style={ { width: '25%' } }>
                        <CentredPanel>
                            <BoxTitle>Admin:</BoxTitle>
                            <div>
                                <LinkHash value={ admin } />
                            </div>
                        </CentredPanel>
                    </SectionContent>

                    <SectionContent style={ { width: '25%' } }>
                        <CentredPanel>
                            <BoxTitle>FUNDED:</BoxTitle>
                            <FundContainer>
                                <span>{`${funded} ETH`}</span>
                            </FundContainer>
                        </CentredPanel>
                    </SectionContent>

                    <SectionContent style={ { width: '25%' } }>
                        <CentredPanel>
                            <BoxTitle>FEES:</BoxTitle>
                            <FundContainer>
                                <span>{`${totalFee} ETH`}</span>
                            </FundContainer>
                        </CentredPanel>
                    </SectionContent>
                </Section>
            );
        }}
    </Subscribe>
);

export default General;
