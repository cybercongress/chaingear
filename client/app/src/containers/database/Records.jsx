import React from 'react';
import { Subscribe } from 'unstated';
import {
    FlexContainer, FlexContainerLeft, FlexContainerRight, AddNewRecordButton,
} from '@cybercongress/ui';
import { DatabaseItem, DatabaseList } from './DatabaseItem';
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
        {(dbPage) => {
	        const {
	            fields, items, isOwner, userAccount, isSchemaExist,
	            duplicateFieldFound, duplicateFieldId, isDbPaused,
	            permissionGroup,
	        } = dbPage.state;

			const rows = items.map((item, index) => (
		        <DatabaseItem
		            clameRecord={ dbPage.claimRecord }
		            removeItemClick={ dbPage.removeItemClick }
		            fundEntryClick={ dbPage.fundEntryClick }
		            onUpdate={ values => dbPage.onUpdate(values, item.id) }
		            onTransfer={ newOwner => dbPage.transferItem(userAccount, newOwner, item.id) }
		            userAccount={ userAccount }
		            fields={ fields }
		            item={ item }
		            index={ item.id }
		            key={ item.id }
		            errorMessage={ duplicateFieldFound && duplicateFieldId === item.id}
		            hideEntryError={ dbPage.hideEntryError }
		            isDbPaused={ isDbPaused }
		            onItemEdit={() => dbPage.onItemEdit(item)}
		        />
		    ));

	        const showAddButton = (isOwner || permissionGroup === Permission.AllUsers) && !isDbPaused && isSchemaExist;

        	return (
        		<div>
	        		{isSchemaExist &&
	                    <FlexContainer line>
	                            <FlexContainerLeft>
	                                RECORDS
	                            </FlexContainerLeft>

	                            <FlexContainerRight>
	                                {showAddButton && <AddNewRecordButton onClick={dbPage.add}>Add new record</AddNewRecordButton>}
	                            </FlexContainerRight>
	                    </FlexContainer>
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
