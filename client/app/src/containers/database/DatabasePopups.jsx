import React from 'react';
import { Subscribe } from 'unstated';
import {
    LinkHash, Popup, PopupContent, PopupFooter, PopupTitle,
    LineTitle, LineControl, WideInput, Button, ContentLineFund,
    Text, ContentLine, ContentLineTextInput,
} from '@cybercongress/ui';
import page from './page';

const DatabasePopups = () => (
    <Subscribe to={ [page] }>
        {(dbPage) => {
            const {
                userAccount, admin, funded, claimFundOpen, claimFeeOpen,
                transferOwnershipOpen, fundDatabaseOpen, pauseDatabaseOpen,
                resumeDatabaseOpen, deleteDatabaseOpen,
            } = dbPage.state;

            return (
                <span>
                    <Popup open={ claimFundOpen }>
                        <PopupTitle>Claim database funds</PopupTitle>
                        <PopupContent>
                            <ContentLineTextInput>
                                <LineTitle>Available to claim:</LineTitle>
                                <LineControl>
                                    <Text>{funded}</Text>
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
                            <Button style={ { marginRight: '20px' } } color='cancel' onClick={ dbPage.closePopups }>cancel</Button>
                            <Button
                              onClick={ () => dbPage.claimDatabaseFunds(dbPage.claimDbInput.value) }
                              color='green'
                            >
                                Confirm
                            </Button>
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
                            <Button style={ { marginRight: '20px' } } color='cancel' onClick={ dbPage.closePopups }>cancel</Button>
                            <Button
                              color='green'
                              onClick={ () => {
                                  const newDbOwner = dbPage.newDbOwnerInput.value;

                                  dbPage.transferDatabaseOwnership(userAccount, newDbOwner);
                              } }
                            >
                                Confirm
                            </Button>
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
                            <Button style={ { marginRight: '20px' } } color='cancel' onClick={ dbPage.closePopups }>Cancel</Button>
                            <Button
                              onClick={ () => dbPage.fundDatabase(dbPage.fundDbInput.value) }
                              color='green'
                            >
                                Confirm
                            </Button>
                        </PopupFooter>
                    </Popup>

                    <Popup open={ deleteDatabaseOpen }>
                        <PopupTitle>Delete registry</PopupTitle>
                        <PopupContent>
                            <ContentLine>
                                <Text>
                                    Your registry will be unlinked from Chaingear,
                                    but you still will be able to operate with it
                                </Text>
                            </ContentLine>
                        </PopupContent>
                        <PopupFooter>
                            <Button style={ { marginRight: '20px' } } color='cancel' onClick={ dbPage.closePopups }>cancel</Button>
                            <Button color='green' onClick={ dbPage.deleteDb }>Confirm</Button>
                        </PopupFooter>
                    </Popup>

                    <Popup open={ pauseDatabaseOpen }>
                        <PopupTitle>Pause database</PopupTitle>
                        <PopupContent>
                            <ContentLine>
                                <Text>
                                    When registry is on pause there will be no ability
                                    to operate with records
                                </Text>
                            </ContentLine>
                        </PopupContent>
                        <PopupFooter>
                            <Button style={ { marginRight: '20px' } } color='cancel' onClick={ dbPage.closePopups }>Cancel</Button>
                            <Button color='green' onClick={ dbPage.pauseDb }>Confirm</Button>
                        </PopupFooter>
                    </Popup>

                    <Popup open={ resumeDatabaseOpen }>
                        <PopupTitle>Resume database</PopupTitle>
                        <PopupContent>
                            <ContentLine>
                                <Text>
                                    Resume registry to operate with records
                                </Text>
                            </ContentLine>
                        </PopupContent>
                        <PopupFooter>
                            <Button style={ { marginRight: '20px' } } color='cancel' onClick={ dbPage.closePopups }>Cancel</Button>
                            <Button color='green' onClick={ dbPage.unpauseDb }>Confirm</Button>
                        </PopupFooter>
                    </Popup>
                </span>
            );
        }}
    </Subscribe>
);

export default DatabasePopups;
