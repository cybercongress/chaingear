import React from 'react';
import { Subscribe } from 'unstated';
import {
    SectionContent, InfoButton,
    FormField, WideSelect,
} from '@cybercongress/ui';
import page from './page';

const Permission = {
    OnlyAdmin: 0,
    Whitelist: 1,
    AllUsers: 2,
};

const CreateEntryPermissionGroup = {
    [Permission.OnlyAdmin]: {
        key: 'OnlyAdmin',
        label: 'ONLY OWNER',
    },
    // 1: {
    //     key: 'Whitelist',
    //     label: 'Whitelist',
    // },
    [Permission.AllUsers]: {
        key: 'AllUsers',
        label: 'All Users',
    },
};


const Overview = () => (
    <Subscribe to={ [page] }>
        {(dbPage) => {
            const {
                items, isOwner, isSchemaExist, isDbPaused, ipfsGateway,
                permissionGroup, description, entryCreationFee, tag,
                contractVersion, databaseAddress, entryCoreAddress, abiIpfsHash,
            } = dbPage.state;

            const permissionGroupStr = CreateEntryPermissionGroup[permissionGroup].label;

            return (
                <SectionContent title='Overview' grow={ 3 } style={ { width: '70%' } }>
                    <FormField
                      label='Description'
                      value={ description }
                      onUpdate={ isOwner && !isDbPaused && dbPage.changeDescription }
                    />
                    <FormField
                      label='Tags'
                      value={ tag }
                    />
                    <FormField
                      label='Record Fee'
                      value={ entryCreationFee.toString() }
                      valueType='ETH'
                      onUpdate={ isOwner && isDbPaused && dbPage.changeEntryCreationFee }
                    />
                    <FormField
                      label='Permissions'
                      value={ permissionGroupStr }
                      onUpdate={ (isOwner && isDbPaused) && dbPage.onUpdatePermissionGroup }
                    >
                        <WideSelect
                          inputRef={ (node) => {
                                dbPage.permissionGroup = node;
                          } }
                          defaultValue={ permissionGroup }
                        >
                            {Object.keys(CreateEntryPermissionGroup).map((n) => {
                                const { label } = CreateEntryPermissionGroup[n];

                                return (
                                    <option value={ n } key={ n }>{label}</option>
                                );
                            })}
                        </WideSelect>
                    </FormField>
                    <FormField
                      label='Entries'
                      value={ items.length }
                    />
                    <FormField
                      label='Version'
                      value={ contractVersion }
                    />
                    <FormField
                      label='Database address'
                      value={ databaseAddress }
                    />
                    <FormField
                      label='Schema address'
                      value={ isSchemaExist ? entryCoreAddress : 'To operate with records, please, define schema' }
                    />
                    <FormField
                      label='Abi link'
                      value={ (
                          <a
                            href={ `${ipfsGateway}/ipfs/${abiIpfsHash}` }
                          >
                              {abiIpfsHash}
                          </a>
                      ) }
                    />
                </SectionContent>
            );
        }}
    </Subscribe>
);

export default Overview;
