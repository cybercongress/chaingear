import React from 'react';
import { Subscribe } from 'unstated';
import {
    LinkHash, Popup, PopupContent, PopupFooter, PopupTitle,
    LineTitle, LineControl, WideInput, Button, ContentLineFund,
    Text, ContentLineTextInput, ContentLine,
} from '@cybercongress/ui';
import ItemEditPopup from './ItemEditPopup';
import page from './page';

const DatabasePopups = () => (
    <Subscribe to={ [page] }>
        {(dbPage) => {
            const {
                userAccount, isSchemaExist,
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
                                    <Text>{recordForAction.currentEntryBalanceETH}</Text>
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
                            <Button style={ { marginRight: '20px' } } color='cancel' onClick={ dbPage.closePopups }>cancel</Button>
                            <Button
                              onClick={ () => dbPage.claimRecord(
                                  recordForAction.id,
                                  dbPage.claimRecordInput.value,
                              ) }
                              color='green'
                            >
                                Confirm
                            </Button>
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
                            <Button style={ { marginRight: '20px' } } color='cancel' onClick={ dbPage.closePopups }>cancel</Button>
                            <Button
                              onClick={ () => {
                                  const newRecordOwner = dbPage.newRecordOwnerInput.value;

                                  dbPage.transferRecordOwnership(
                                      userAccount, newRecordOwner, recordForAction.id,
                                  );
                              } }
                              color='green'
                            >
                                Confirm
                            </Button>
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
                            <Button style={ { marginRight: '20px' } } color='cancel' onClick={ dbPage.closePopups }>Cancel</Button>
                            <Button
                              onClick={ () => dbPage.fundRecord(
                                  recordForAction.id, dbPage.fundRecordInput.value,
                              ) }
                              color='green'
                            >
                                Confirm
                            </Button>
                        </PopupFooter>
                    </Popup>

                    <Popup open={ deleteRecordOpen }>
                        <PopupTitle>Delete record</PopupTitle>
                        <PopupContent>
                            <ContentLine>
                                <Text>
                                    Delete record #
                                    {recordForAction.id}
                                </Text>
                            </ContentLine>
                        </PopupContent>
                        <PopupFooter>
                            <Button style={ { marginRight: '20px' } } color='cancel' onClick={ dbPage.closePopups }>cancel</Button>
                            <Button
                              onClick={ () => dbPage.deleteRecord(
                                recordForAction.id,
                            ) }
                              color='green'
                            >
                                Confirm
                            </Button>
                        </PopupFooter>
                    </Popup>
                    {editRecordOpen && (
                        <ItemEditPopup open={ editRecordOpen } />
                    )}
                </span>
            );
        }}
    </Subscribe>
);

export default DatabasePopups;
