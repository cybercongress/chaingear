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

import page from './page';

const Header = () => (
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

        	return (
                <div>
                    <Section>
                        <div style={ { marginLeft: '15px' } }>
                            <ActionLink to='/'>BACK TO CHAINGEAR</ActionLink>
                            {!isSchemaExist &&
                                <ActionLink style={{marginLeft: 15}} to={`/schema/${databaseSymbol}`}>Define schema</ActionLink>
                            }
                        </div>
                    </Section>

                    <DbHeader>
                        <PageTitle>{name}</PageTitle>

                        {!isSchemaExist &&
                            <ProgressBar>
                                <CircleLable type='complete' number='1' text='Registry initialization' />
                                <CircleLable number='2' text='Schema definition' />
                                <CircleLable number='3' text='Contract code saving' />
                            </ProgressBar>
                        }
                        <DbHeaderLine>
                            <DbHeaderLeft>symbol: {databaseSymbol}</DbHeaderLeft>

                            <DbHeaderRight>
                                status: { isDbPaused ? 'paused' : 'operational' }

                                <DbMenu>
                                    <MenuPopup>
                                        {isOwner && !isDbPaused
                                            && [
                                                <MenuPopupItem
                                                  key='transferOwnership'
                                                  icon={<MenuPopupTransferIcon />}
                                                  onClick={page.onTransferOwnership}
                                                >
                                                    Transfer ownership
                                                </MenuPopupItem>,
                                                <MenuSeparator key='separator0' />,
                                            ]
                                        }
                                        {!isDbPaused
                                            && <MenuPopupItem
                                              key='fundRegistry'
                                              icon={<MenuPopupEditIcon />}
                                              onClick={page.onFundDb}>
                                              Fund registry
                                            </MenuPopupItem>
                                        }
                                        {isOwner && !isDbPaused
                                            && [
                                                <MenuPopupItem
                                                  key='claimFunds'
                                                  icon={<MenuPopupEditIcon />}
                                                  onClick={page.onClaimFunds}
                                                >
                                                    Claim Funds
                                                </MenuPopupItem>,
                                                <MenuSeparator key='separator1' />,
                                                <MenuPopupItem
                                                  key='pauseDB'
                                                  icon={<MenuPopupPauseIcon />}
                                                  onClick={page.onPauseDb}>
                                                  Pause database
                                                </MenuPopupItem>,
                                            ]
                                        }
                                        {isDbPaused && isOwner
                                            && <MenuPopupItem
                                              key='unpauseDB'
                                              icon={<MenuPopupResumeIcon />}
                                              onClick={page.onResumeDb}>
                                              Resume database
                                            </MenuPopupItem>
                                        }
                                        {isDbPaused && isOwner
                                            && [
                                                <MenuSeparator key='separator2' />,
                                                <MenuPopupItem
                                                  key='deleteDB'
                                                  icon={<MenuPopupDeleteIcon />}
                                                  onClick={page.onDeleteDb}>
                                                  Delete registry
                                                </MenuPopupItem>,
                                            ]
                                        }
                                    </MenuPopup>
                                </DbMenu>
                            </DbHeaderRight>
                        </DbHeaderLine>
                    </DbHeader>
                </div>
	        );
        }}
    </Subscribe>
);

export default Header;
