import React from 'react';

import { Container, Subscribe, Provider } from 'unstated';
import {DatabaseItem, DatabaseList} from './DatabaseItem';

import {
	DbHeader, DbHeaderLine, DbHeaderLeft, DbHeaderRight, Button
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

const Records = () => (
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

			const rows = items.map((item, index) => (
		        <DatabaseItem
		            clameRecord={ page.claimRecord }
		            removeItemClick={ page.removeItemClick }
		            fundEntryClick={ page.fundEntryClick }
		            onUpdate={ values => page.onUpdate(values, item.id) }
		            onTransfer={ newOwner => page.transferItem(userAccount, newOwner, item.id) }
		            userAccount={ userAccount }
		            fields={ fields }
		            item={ item }
		            index={ item.id }
		            key={ item.id }
		            errorMessage={ duplicateFieldFound && duplicateFieldId === item.id}
		            hideEntryError={ page.hideEntryError }
		            isDbPaused={ isDbPaused }
		            onItemEdit={() => page.onItemEdit(item)}
		        />
		    ));

	        const showAddButton = (isOwner || permissionGroup === Permission.AllUsers) && !isDbPaused && isSchemaExist;

        	return (
        		<div>
	        		{isSchemaExist &&
	                    <DbHeader>
	                        <DbHeaderLine>
	                            <DbHeaderLeft>
	                                RECORDS
	                            </DbHeaderLeft>

	                            <DbHeaderRight>
	                                {showAddButton && <Button onClick={page.add}>Add new record</Button>}
	                            </DbHeaderRight>
	                        </DbHeaderLine>
	                    </DbHeader>
	                }

		            <DatabaseList>
	                    {rows}
	                </DatabaseList>
                </div>
	        );
        }}
    </Subscribe>
);

export default Records;
