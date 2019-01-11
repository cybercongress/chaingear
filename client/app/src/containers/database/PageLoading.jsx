import React from 'react';
import { Subscribe } from 'unstated';
import { StatusBar } from '@cybercongress/ui';
import page from './page';

const PageLoading = () => (
    <Subscribe to={ [page] }>
        {(dbPage) => {
            const {
                loading,
            } = dbPage.state;

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
