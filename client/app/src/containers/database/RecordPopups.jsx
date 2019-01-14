import React from 'react';
import { Subscribe } from 'unstated';
import {
    LinkHash, Popup, PopupContent, PopupFooter, PopupTitle,
    LineTitle, LineControl, WideInput, PopupButton, ContentLineFund,
    LineText, ContentLineTextInput, ContentLine,
} from '@cybercongress/ui';
import ItemEditPopup from './ItemEditPopup';
import page from './page';

const DatabasePopups = () => (
    <Subscribe to={ [page] }>
        {(dbPage) => {
            const {
                fields, userAccount, isSchemaExist,

                recordForAction,

                claimRecordFundOpen,
                transferRecordOwnershipOpen,
                fundRecordOpen,
                deleteRecordOpen,
                editRecordOpen,

            } = dbPage.state;

            if (!(isSchemaExist && recordForAction)) {
                return (
                    <div />
                );
            }

            return (
                <span>
                    <Popup open={ claimRecordFundOpen }>
                        <PopupTitle>Claim record funds</PopupTitle>
                        <PopupContent>
                            <ContentLineTextInput>
                                <LineTitle>Available to claim:</LineTitle>
                                <LineControl>
                                    <LineText>{recordForAction.currentEntryBalanceETH}</LineText>
                                </LineControl>
                            </ContentLineTextInput>
                            <ContentLineTextInput>
                                <LineTitle>Claim amount:</LineTitle>
                                <LineControl>
                                    <WideInput
                                      inputRef={ (node) => { dbPage.claimRecordInput = node; } }
                                      placeholder='0.00 ETH'
                                    />
                                </LineControl>
                            </ContentLineTextInput>
                        </PopupContent>
                        <PopupFooter>
                            <PopupButton onClick={ dbPage.closePopups } type='cancel'>cancel</PopupButton>
                            <PopupButton
                              onClick={ () => dbPage.claimRecord(
                                  recordForAction.id,
                                  dbPage.claimRecordInput.value,
                              ) }
                              type='confirm'
                            >
                                Confirm
                            </PopupButton>
                        </PopupFooter>
                    </Popup>

                    <Popup open={ transferRecordOwnershipOpen }>
                        <PopupTitle>Transfer record ownership</PopupTitle>
                        <PopupContent>
                            <ContentLineTextInput>
                                <LineTitle>Current owner:</LineTitle>
                                <LineControl>
                                    <LinkHash noPadding noCopy value={ recordForAction.owner } />
                                </LineControl>
                            </ContentLineTextInput>
                            <ContentLineTextInput>
                                <LineTitle>New owner:</LineTitle>
                                <LineControl>
                                    <WideInput inputRef={ (node) => {
                                        dbPage.newRecordOwnerInput = node;
                                    } }
                                    />
                                </LineControl>
                            </ContentLineTextInput>
                        </PopupContent>
                        <PopupFooter>
                            <PopupButton onClick={ dbPage.closePopups } type='cancel'>cancel</PopupButton>
                            <PopupButton
                              onClick={ () => {
                                  const newRecordOwner = dbPage.newRecordOwnerInput.value;

                                  dbPage.transferRecordOwnership(
                                      userAccount, newRecordOwner, recordForAction.id,
                                  );
                              } }
                              type='confirm'
                            >
                                Confirm
                            </PopupButton>
                        </PopupFooter>
                    </Popup>

                    <Popup open={ fundRecordOpen }>
                        <PopupTitle>Fund record</PopupTitle>
                        <PopupContent>
                            <ContentLineFund>
                                <LineTitle>Amount:</LineTitle>
                                <LineControl>
                                    <WideInput inputRef={ (node) => {
                                        dbPage.fundRecordInput = node;
                                    } }
                                    />
                                </LineControl>
                            </ContentLineFund>
                        </PopupContent>
                        <PopupFooter>
                            <PopupButton onClick={ dbPage.closePopups } type='cancel'>Cancel</PopupButton>
                            <PopupButton
                              onClick={ () => dbPage.fundRecord(
                                  recordForAction.id, dbPage.fundRecordInput.value,
                              ) }
                              type='confirm'
                            >
                                Confirm
                            </PopupButton>
                        </PopupFooter>
                    </Popup>

                    <Popup open={ deleteRecordOpen }>
                        <PopupTitle>Delete record</PopupTitle>
                        <PopupContent>
                            <ContentLine>
                                <LineText>
                                    Delete record #
                                    {recordForAction.id}
                                </LineText>
                            </ContentLine>
                        </PopupContent>
                        <PopupFooter>
                            <PopupButton onClick={ dbPage.closePopups } type='cancel'>cancel</PopupButton>
                            <PopupButton
                              onClick={ () => dbPage.deleteRecord(
                                recordForAction.id,
                            ) }
                              type='confirm'
                            >
                                Confirm
                            </PopupButton>
                        </PopupFooter>
                    </Popup>

                    <ItemEditPopup
                      open={ editRecordOpen }
                      item={ recordForAction }
                      fields={ fields }
                      onCancelClick={ dbPage.closePopups }
                      onConfirmClick={ dbPage.updateRecord }
                    />
                </span>
            );
        }}
    </Subscribe>
);

export default DatabasePopups;
