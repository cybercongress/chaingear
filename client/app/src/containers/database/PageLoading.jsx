import React from 'react';

import { Subscribe } from 'unstated';
import { StatusBar } from '@cybercongress/ui';

import page from './page';

const PageLoading = () => (
    <Subscribe to={ [page] }>
        {(page) => {
            const {
                loading,
            } = page.state;

            return (
                <StatusBar
                  open={ loading }
                  message='loading...'
                />
            );
        }}
    </Subscribe>
);

export default PageLoading;
