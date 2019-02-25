import React from 'react';
import { Subscribe } from 'unstated';
import {
    Centred, SectionContent, BenContainer, BenPieChart,
} from '@cybercongress/ui';
import { calculateBensShares } from '../../utils/utils';

import page from './page';

const Beneficiaries = () => (
    <Subscribe to={ [page] }>
        {(dbPage) => {
            const {
                beneficiaries,
            } = dbPage.state;

            return (
                <SectionContent title='Beneficiaries' grow={ 0 } style={ { width: '30%' } }>
                    <Centred>
                        <BenContainer>
                            <BenPieChart
                              bens={ beneficiaries }
                              calculateBensShares={ calculateBensShares }
                            />
                        </BenContainer>
                    </Centred>
                </SectionContent>
            );
        }}
    </Subscribe>
);

export default Beneficiaries;
