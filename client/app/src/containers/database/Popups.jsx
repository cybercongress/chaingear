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

const Popups = () => (
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
	            <span>
	                <Popup open={claimFundOpen}>
	                    <PopupTitle>Claim database funds</PopupTitle>
	                    <PopupContent>
	                        <ContentLineTextInput>
	                            <LineTitle>Available to claim:</LineTitle>
	                            <LineControl>
	                                <LineText>{funded}</LineText>
	                            </LineControl>
	                        </ContentLineTextInput>
	                        <ContentLineTextInput>
	                            <LineTitle>Claim amount:</LineTitle>
	                            <LineControl>
	                                <WideInput inputRef={node => page.claimDbInput = node} placeholder='0.00 ETH' />
	                            </LineControl>
	                        </ContentLineTextInput>
	                    </PopupContent>
	                    <PopupFooter>
	                        <PopupButton onClick={page.closePopups} type='cancel'>cancel</PopupButton>
	                        <PopupButton onClick={() => page.claimDatabase(page.claimDbInput.value)} type='confirm'>Confirm</PopupButton>
	                    </PopupFooter>
	                </Popup>

	                <Popup open={transferOwnershipOpen}>
	                    <PopupTitle>Transfer database ownership</PopupTitle>
	                    <PopupContent>
	                        <ContentLineTextInput>
	                            <LineTitle>Current owner:</LineTitle>
	                            <LineControl>
	                                <LinkHash noPadding noCopy value={admin} />
	                            </LineControl>
	                        </ContentLineTextInput>
	                        <ContentLineTextInput>
	                            <LineTitle>New owner:</LineTitle>
	                            <LineControl>
	                                <WideInput inputRef={node => page.newDbOwnerInput = node} />
	                            </LineControl>
	                        </ContentLineTextInput>
	                    </PopupContent>
	                    <PopupFooter>
	                        <PopupButton onClick={page.closePopups} type='cancel'>cancel</PopupButton>
	                        <PopupButton onClick={() => page.transferDatabaseOwnership(userAccount, this.newDbOwnerInput.value)} type='confirm'>Confirm</PopupButton>
	                    </PopupFooter>
	                </Popup>

	                <Popup open={fundDatabaseOpen}>
	                    <PopupTitle>Fund database</PopupTitle>
	                    <PopupContent>
	                        <ContentLineFund>
	                            <LineTitle>Amount:</LineTitle>
	                            <LineControl>
	                                <WideInput inputRef={node => page.fundDbInput = node} />
	                            </LineControl>
	                        </ContentLineFund>
	                    </PopupContent>
	                    <PopupFooter>
	                        <PopupButton onClick={page.closePopups} type='cancel'>Cancel</PopupButton>
	                        <PopupButton onClick={() => page.fundDatabase(page.fundDbInput.value)} type='confirm'>Confirm</PopupButton>
	                    </PopupFooter>
	                </Popup>

	                <Popup open={deleteDatabaseOpen}>
	                    <PopupTitle>Delete registry</PopupTitle>
	                    <PopupContent>
	                        <ContentLine>
	                          <LineText>
	                            Your registry will be unlinked from Chaingear, but you still will be able to operate with it
	                          </LineText>
	                        </ContentLine>
	                    </PopupContent>
	                    <PopupFooter>
	                        <PopupButton onClick={page.closePopups} type='cancel'>cancel</PopupButton>
	                        <PopupButton onClick={page.deleteDb} type='confirm'>Confirm</PopupButton>
	                    </PopupFooter>
	                </Popup>

	                <Popup open={pauseDatabaseOpen}>
	                    <PopupTitle>Pause database</PopupTitle>
	                    <PopupContent>
	                        <ContentLine>
	                          <LineText>
	                            When registry is on pause there will be no ability to operate with records
	                          </LineText>
	                        </ContentLine>
	                    </PopupContent>
	                    <PopupFooter>
	                        <PopupButton onClick={page.closePopups} type='cancel'>Cancel</PopupButton>
	                        <PopupButton onClick={page.pauseDb} type='confirm'>Confirm</PopupButton>
	                    </PopupFooter>
	                </Popup>

	                <Popup open={resumeDatabaseOpen}>
	                    <PopupTitle>Resume database</PopupTitle>
	                    <PopupContent>
	                        <ContentLine>
	                          <LineText>
	                            Resume registry to operate with records
	                          </LineText>
	                        </ContentLine>
	                    </PopupContent>
	                    <PopupFooter>
	                        <PopupButton onClick={page.closePopups} type='cancel'>Cancel</PopupButton>
	                        <PopupButton onClick={page.unpauseDb} type='confirm'>Confirm</PopupButton>
	                    </PopupFooter>
	                </Popup>

	                <ItemEditPopup
	                  open={editRecordOpen}
	                  item={itemForEdit}
	                  fields={fields}
	                  onCancelClick={page.closePopups}
	                  onConfirmClick={page.onUpdate}
	                />
	            </span>
	        );
        }}
    </Subscribe>
);

export default Popups;
