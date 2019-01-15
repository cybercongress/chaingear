import React from 'react';
import { Subscribe } from 'unstated';
import {
    LinkHash, Section, SectionContent,
    Text, CentredPanel,
} from '@cybercongress/ui';
import page from './page';
import { formatDate } from '../../utils/utils';

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
                            <Text uppercase color='black' style={{marginBottom: '20px'}}>Created:</Text>
                            <Text uppercase color='black'>
                                {createdTimestamp ? formatDate(createdTimestamp.toNumber()) : ''}
                            </Text>
                        </CentredPanel>
                    </SectionContent>

                    <SectionContent style={ { width: '25%' } }>
                        <CentredPanel>
                            <Text uppercase color='black' style={{marginBottom: '20px'}}>Admin:</Text>
                            <div>
                                <LinkHash value={ admin } />
                            </div>
                        </CentredPanel>
                    </SectionContent>

                    <SectionContent style={ { width: '25%' } }>
                        <CentredPanel>
                            <Text uppercase color='black' style={{marginBottom: '20px'}}>FUNDED:</Text>
                            <Text uppercase color='black'>
                                {`${funded} ETH`}
                            </Text>
                        </CentredPanel>
                    </SectionContent>

                    <SectionContent style={ { width: '25%' } }>
                        <CentredPanel>
                            <Text uppercase color='black' style={{marginBottom: '20px'}}>FEES:</Text>
                            <Text uppercase color='black'>
                                {`${totalFee} ETH`}
                            </Text>
                        </CentredPanel>
                    </SectionContent>
                </Section>
            );
        }}
    </Subscribe>
);

export default General;
