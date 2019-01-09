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
import {calculateBensShares} from '../../utils/utils';
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

const Beneficiaries = () => (
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
	            ipfsHash,
	            itemForEdit,

	            claimFundOpen,
	            claimFeeOpen,
	            transferOwnershipOpen,
	            fundDatabaseOpen,
	            pauseDatabaseOpen,
	            resumeDatabaseOpen,
	            deleteDatabaseOpen,
	            editRecordOpen,
	        } = page.state;
  
          const permissionGroupStr = CreateEntryPermissionGroup[permissionGroup].label;

        	return (
                <SectionContent title='Beneficiaries' grow={ 0 } style={ { width: '25%' } }>
                    <Centred>
                        <BenContainer>
                            <BenPieChart
                                bens={beneficiaries}
                                calculateBensShares={calculateBensShares}
                            />
                        </BenContainer>
                    </Centred>
                </SectionContent>
	        );
        }}
    </Subscribe>
);

export default Beneficiaries;
