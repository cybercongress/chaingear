import React from 'react';
import { Subscribe } from 'unstated';
import {
    LinkHash,
    Popup,
    PopupContent,
    PopupFooter,
    PopupTitle,
    LineTitle,
    LineControl,
    WideInput,
    Button,
    ContentLineFund,
    TextEv as Text,
    ContentLine,
    ContentLineTextInput,
    Dialog,
    Input,
    Pane,
} from '@cybercongress/ui';
import page from './page';

const DatabasePopups = () => (
    <Subscribe to={ [page] }>
        {(dbPage) => {
            const {
                userAccount,
                admin,
                funded,
                claimFundOpen,
                claimFeeOpen,
                transferOwnershipOpen,
                fundDatabaseOpen,
                pauseDatabaseOpen,
                resumeDatabaseOpen,
                deleteDatabaseOpen,
                newDbOwnerInput,
            } = dbPage.state;

            return (
                <span>
                    {/* <Popup open={ claimFundOpen }>
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
            */}

                    <Dialog
                      isShown={ transferOwnershipOpen }
                      title='Transfer database ownership'
                      onCloseComplete={dbPage.closePopups}
                      onConfirm={
                        () => {
                            const newDbOwner = newDbOwnerInput;
                            dbPage.transferDatabaseOwnership(userAccount, newDbOwner);
                        }
                      }
                    >
                        <Pane display='grid' gridTemplateRows='1fr 1fr' marginX={ 20 } marginY={ 20 }>
                            <Pane
                              display='grid'
                              gridTemplateColumns='1fr 2fr'
                              marginBottom='20px'
                              alignItems='center'
                            >
                                <Text>Current owner:</Text>
                                <LinkHash noPadding noCopy value={ admin } />
                            </Pane>
                            <Pane
                              display='grid'
                              gridTemplateColumns='1fr 2fr'
                              alignItems='center'
                            >
                                <Text>New owner:</Text>
                                <Input width='60%' value={newDbOwnerInput} onChange={dbPage.newDbOwnerInputOnChange} />
                            </Pane>
                        </Pane>
                        {/* <WideInput inputRef={ (node) => {
                                        dbPage.newDbOwnerInput = node;
                                    } }
                                    /> */}
                        {/* <PopupFooter>
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
                        </PopupFooter> */}
                    </Dialog>

                    {/*
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
                    </Popup> */}

                    <Dialog
                      isShown={ deleteDatabaseOpen }
                      title='Delete registry'
                      intent='danger'
                      onCloseComplete={ dbPage.closePopups }
                      onConfirm={ dbPage.deleteDb }
                        //   onCloseComplete={() => setState({ isShown: false })}
                      confirmLabel='Confirm'
                    >
                        Your registry will be unlinked from Chaingear, but you still will be able to
                        operate with it
                        {/* <PopupTitle>Delete database</PopupTitle>
                        <PopupContent>
                            <ContentLine>
                                <Text>
                                    Your database will be unlinked from Chaingear,
                                    but you still will be able to operate with it
                                </Text>
                            </ContentLine>
                        </PopupContent>
                        <PopupFooter>
                            <Button style={ { marginRight: '20px' } } color='cancel' onClick={ dbPage.closePopups }>cancel</Button>
                            <Button color='green' onClick={ dbPage.deleteDb }>Confirm</Button>
                        </PopupFooter> */}
                    </Dialog>

                    {/* <Popup open={ pauseDatabaseOpen }>
                        <PopupTitle>Pause database</PopupTitle>
                        <PopupContent>
                            <ContentLine>
                                <Text>
                                    When database is on pause there will be no ability
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
                                    Resume database to operate with records
                                </Text>
                            </ContentLine>
                        </PopupContent>
                        <PopupFooter>
                            <Button style={ { marginRight: '20px' } } color='cancel' onClick={ dbPage.closePopups }>Cancel</Button>
                            <Button color='green' onClick={ dbPage.unpauseDb }>Confirm</Button>
                        </PopupFooter>
                    </Popup> */}
                </span>
            );
        }}
    </Subscribe>
);

export default DatabasePopups;
