import React from 'react';
import { Subscribe } from 'unstated';
import {
    LinkHash, Section, SectionContent,
    TextEv as Text, CentredPanel,
    CardHover,
    Pane,
} from '@cybercongress/ui';
import page from './page';
import { formatDate } from '../../utils/utils';

const CardGeneral = ({ value, title }) => (
    <CardHover
      flex={ 1 }
      paddingY={ 50 }
      display='flex'
      alignItems='center'
      flexDirection='column'
      backgroundColor='#000'
        //   marginX={ 15 }
      boxShadow='0 0 10px 1px #36d6ae'
    >
        <Text display='inline-block' marginBottom={ 15 } color='#fff' fontSize='1em'>
            {value}
        </Text>

        <Text display='inline-block' color='#fff'>
            {title}
        </Text>
    </CardHover>
);

const General = () => (
    <Subscribe to={ [page] }>
        {(dbPage) => {
            const {
                createdTimestamp,
                admin,
                totalFee,
                funded,
                databaseSymbol,
            } = dbPage.state;

            return (
                <Section title='General'>
                     <Pane
                        display='grid'
                        gridTemplateColumns='1fr 1fr 1fr 1fr'
                        width='100%'
                        gridGap='15px'
                        >
                    <CardGeneral value={databaseSymbol} title='name' />
                    <CardGeneral value={ <LinkHash style={{color: '#fff'}} value={ admin } /> } title='owner' />
                    <CardGeneral value={createdTimestamp ? formatDate(createdTimestamp.toNumber()) : ''} title='creation time (UTC)' />
                    <CardGeneral value={` ${funded} ETH / ${totalFee} ETH `} title='funds / fee' />
                </Pane>
                    {/* <SectionContent style={ { width: '25%' } }>
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
                    </SectionContent> */}
                </Section>
            );
        }}
    </Subscribe>
);

export default General;
