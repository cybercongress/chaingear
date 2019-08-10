import React from 'react';
import { Subscribe } from 'unstated';
import {
    Centred,
    SectionContent,
    BenContainer,
    BenPieChart,
    StructureContainer,
    Structure,
    Pane,
    TextEv as Text,
} from '@cybercongress/ui';
import { calculateBensShares } from '../../utils/utils';

import page from './page';

const Beneficiaries = () => (
    <Subscribe to={ [page] }>
        {(dbPage) => {
            const { beneficiaries } = dbPage.state;

            return (
                <Pane display='flex' flexDirection='column'>
                    <Text display='inline-block' marginBottom={ 16 } fontSize='20px' color='#ffffff'>
                        Beneficiaries
                    </Text>
                    <Pane
                      backgroundColor='#000'
                      title='Beneficiaries'
                      display='flex'
                      flexDirection='column'
                      alignItems='center'
                      justifyContent='center'
                      paddingY={ 20 }
                      boxSizing='border-box'
                      height='100%'
                      boxShadow='0 0 10px 1px #36d6ae'
                      borderRadius={ 4 }
                    >
                        <StructureContainer>
                            <Structure
                              bens={ beneficiaries }
                              calculateBensShares={ calculateBensShares }
                            />
                        </StructureContainer>
                    </Pane>
                </Pane>
            );
        }}
    </Subscribe>
);

export default Beneficiaries;
