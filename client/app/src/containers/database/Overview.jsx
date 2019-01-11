import React from 'react';

import { Container, Subscribe, Provider } from 'unstated';
import {
    ActionLink, LinkHash, MainContainer, Section, SectionContent,
    Centred, Button, FundContainer, BoxTitle, StatusBar, DbHeader,
    DbHeaderLeft, DbHeaderRight, DbHeaderLine,
    DbMenu, MenuPopup, MenuPopupItem, MenuSeparator, MenuPopupDeleteIcon,
    MenuPopupEditIcon, MenuPopupTransferIcon,
    Popup, PopupContent, PopupFooter, PopupTitle,
    BenContainer, BenPieChart, MenuPopupResumeIcon, MenuPopupPauseIcon,
    LineTitle, LineControl, WideInput, PopupButton, ContentLineFund,
    LineText, ContentLine, ContentLineTextInput,
    CentredPanel, PageTitle, ProgressBar, CircleLable, FormField, WideSelect,
} from '@cybercongress/ui';
import ItemEditPopup from './ItemEditPopup';
const moment = require('moment');

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

import page from './page';

const Overview = () => (
    <Subscribe to={ [page] }>
        {page => {
	        const {
	            fields, items, loading, isOwner, userAccount, isSchemaExist, databaseSymbol,
	            duplicateFieldFound, duplicateFieldId, isDbPaused, ipfsGateway, beneficiaries,
	            permissionGroup,
	            name,
	            description,
	            createdTimestamp,
	            entryCreationFee,
	            admin,
	            totalFee,
	            funded,
	            tag,
	            owner,
	            contractVersion,
	            databaseAddress,
	            entryCoreAddress,
                abiIpfsHash,
	        } = page.state;

          const permissionGroupStr = CreateEntryPermissionGroup[permissionGroup].label;

        	return (
                <SectionContent title='Overview' grow={ 3 } style={ { width: '70%' } }>
                            <FormField
                                label='Description'
                                value={ description }
                                onUpdate={ isOwner && !isDbPaused && page.changeDescription }
                            />
                            <FormField
                                label='Tags'
                                value={ tag }
                            />
                            <FormField
                                label='Record Fee'
                                value={ entryCreationFee.toString() }
                                valueType='ETH'
                                onUpdate={ isOwner && isDbPaused && page.changeEntryCreationFee }
                            />
                            <FormField
                              label='Permissions'
                              value={ permissionGroupStr }
                              onUpdate={ (isOwner && isDbPaused) && page.onUpdatePermissionGroup }
                            >
                                <WideSelect
                                  inputRef={ (node) => { page.permissionGroup = node; } }
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
                                    <a href={ `${ipfsGateway}/ipfs/${abiIpfsHash}` } target='_blank'>
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
