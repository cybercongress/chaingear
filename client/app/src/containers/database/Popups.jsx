import React from 'react';
import { Subscribe } from 'unstated';
import {
    LinkHash, Popup, PopupContent, PopupFooter, PopupTitle,
    LineTitle, LineControl, WideInput, PopupButton, ContentLineFund,
    LineText, ContentLine, ContentLineTextInput,
} from '@cybercongress/ui';
import ItemEditPopup from './ItemEditPopup';
import page from './page';

const Popups = () => (
    <Subscribe to={ [page] }>
        {(dbPage) => {
            const {
                fields, userAccount, isSchemaExist, admin, funded, itemForEdit,
                claimFundOpen, claimFeeOpen, transferOwnershipOpen, fundDatabaseOpen,
                pauseDatabaseOpen, resumeDatabaseOpen, deleteDatabaseOpen, editRecordOpen,
            } = dbPage.state;

            return (
                <span>
                    <Popup open={ claimFundOpen }>
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
                                    <WideInput
                                      inputRef={ (node) => { dbPage.claimDbInput = node; } }
                                      placeholder='0.00 ETH'
                                    />
                                </LineControl>
                            </ContentLineTextInput>
                        </PopupContent>
                        <PopupFooter>
                            <PopupButton onClick={ dbPage.closePopups } type='cancel'>cancel</PopupButton>
                            <PopupButton
                              onClick={ () => dbPage.claimDatabase(dbPage.claimDbInput.value) }
                              type='confirm'
                            >
                                Confirm
                            </PopupButton>
                        </PopupFooter>
                    </Popup>

                    <Popup open={ transferOwnershipOpen }>
                        <PopupTitle>Transfer database ownership</PopupTitle>
                        <PopupContent>
                            <ContentLineTextInput>
                                <LineTitle>Current owner:</LineTitle>
                                <LineControl>
                                    <LinkHash noPadding noCopy value={ admin } />
                                </LineControl>
                            </ContentLineTextInput>
                            <ContentLineTextInput>
                                <LineTitle>New owner:</LineTitle>
                                <LineControl>
                                    <WideInput inputRef={ (node) => {
                                        dbPage.newDbOwnerInput = node;
                                    } }
                                    />
                                </LineControl>
                            </ContentLineTextInput>
                        </PopupContent>
                        <PopupFooter>
                            <PopupButton onClick={ dbPage.closePopups } type='cancel'>cancel</PopupButton>
                            <PopupButton
                              onClick={ () => {
                                  const newDbOwner = this.newDbOwnerInput.value;

                                  dbPage.transferDatabaseOwnership(userAccount, newDbOwner);
                              } }
                              type='confirm'
                            >
                                Confirm
                            </PopupButton>
                        </PopupFooter>
                    </Popup>

                    <Popup open={ fundDatabaseOpen }>
                        <PopupTitle>Fund database</PopupTitle>
                        <PopupContent>
                            <ContentLineFund>
                                <LineTitle>Amount:</LineTitle>
                                <LineControl>
                                    <WideInput inputRef={ (node) => {
                                        dbPage.fundDbInput = node;
                                    } }
                                    />
                                </LineControl>
                            </ContentLineFund>
                        </PopupContent>
                        <PopupFooter>
                            <PopupButton onClick={ dbPage.closePopups } type='cancel'>Cancel</PopupButton>
                            <PopupButton
                              onClick={ () => dbPage.fundDatabase(dbPage.fundDbInput.value) }
                              type='confirm'
                            >
                                Confirm
                            </PopupButton>
                        </PopupFooter>
                    </Popup>

                    <Popup open={ deleteDatabaseOpen }>
                        <PopupTitle>Delete registry</PopupTitle>
                        <PopupContent>
                            <ContentLine>
                                <LineText>
                                    Your registry will be unlinked from Chaingear,
                                    but you still will be able to operate with it
                                </LineText>
                            </ContentLine>
                        </PopupContent>
                        <PopupFooter>
                            <PopupButton onClick={ dbPage.closePopups } type='cancel'>cancel</PopupButton>
                            <PopupButton onClick={ dbPage.deleteDb } type='confirm'>Confirm</PopupButton>
                        </PopupFooter>
                    </Popup>

                    <Popup open={ pauseDatabaseOpen }>
                        <PopupTitle>Pause database</PopupTitle>
                        <PopupContent>
                            <ContentLine>
                                <LineText>
                                    When registry is on pause there will be no ability
                                    to operate with records
                                </LineText>
                            </ContentLine>
                        </PopupContent>
                        <PopupFooter>
                            <PopupButton onClick={ dbPage.closePopups } type='cancel'>Cancel</PopupButton>
                            <PopupButton onClick={ dbPage.pauseDb } type='confirm'>Confirm</PopupButton>
                        </PopupFooter>
                    </Popup>

                    <Popup open={ resumeDatabaseOpen }>
                        <PopupTitle>Resume database</PopupTitle>
                        <PopupContent>
                            <ContentLine>
                                <LineText>
                                    Resume registry to operate with records
                                </LineText>
                            </ContentLine>
                        </PopupContent>
                        <PopupFooter>
                            <PopupButton onClick={ dbPage.closePopups } type='cancel'>Cancel</PopupButton>
                            <PopupButton onClick={ dbPage.unpauseDb } type='confirm'>Confirm</PopupButton>
                        </PopupFooter>
                    </Popup>

                    {isSchemaExist && itemForEdit
                        && (
                            <ItemEditPopup
                              open={ editRecordOpen }
                              item={ itemForEdit }
                              fields={ fields }
                              onCancelClick={ dbPage.closePopups }
                              onConfirmClick={ dbPage.onUpdate }
                            />
                        )
                    }
                </span>
            );
        }}
    </Subscribe>
);

export default Popups;
