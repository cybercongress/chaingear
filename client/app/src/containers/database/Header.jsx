import React from 'react';
import { hashHistory } from 'react-router';
import { Subscribe } from 'unstated';
import {
    DbMenu, MenuPopup, MenuPopupItem, MenuSeparator,
    MenuPopupDeleteIcon, MenuPopupAccountIcon, MenuPopupTransferIcon,
    MenuPopupResumeIcon, MenuPopupPauseIcon,
    PageTitle, ProgressBar, CircleLable, Section,
    PopupBar, Text, PopupBarFooter, Button,
    FlexContainer, FlexContainerLeft, FlexContainerRight,
} from '@cybercongress/ui';

import page from './page';

const Header = () => (
    <Subscribe to={ [page] }>
        {(dbPage) => {
            const {
                isOwner, isSchemaExist, databaseSymbol, isDbPaused, name,
            } = dbPage.state;

            const onDefineSchemaClick = () => {
                hashHistory.push(`/schema/${databaseSymbol}`);
            };

            return (
                <div>
                    <Section>
                        <div style={ { marginLeft: '15px' } }>
                            <Button
                              color='blue'
                              to='/'
                            >
                                BACK TO CHAINGEAR
                            </Button>
                        </div>
                    </Section>

                    <PageTitle>{name}</PageTitle>

                    {!isSchemaExist && isOwner
                        && (
                            <ProgressBar>
                                <CircleLable type='complete' number='1' text='Database initialization' />
                                <CircleLable number='2' text='Schema definition'>
                                    <PopupBar>
                                        <Text lineheight>
                                            To operate with records, please, define schema
                                        </Text>
                                        <PopupBarFooter>
                                            <Button
                                              transparent='true'
                                              style={ { color: '#b00020' } }
                                              onClick={ () => onDefineSchemaClick(databaseSymbol) }
                                            >
                                                complete step
                                            </Button>
                                        </PopupBarFooter>
                                    </PopupBar>
                                </CircleLable>
                            </ProgressBar>
                        )
                    }
                    <FlexContainer line>
                        <FlexContainerLeft>{`symbol: ${databaseSymbol}`}</FlexContainerLeft>

                        <FlexContainerRight>
                            { `status: ${isDbPaused ? 'paused' : 'operational'}` }
                            <DbMenu>
                                <MenuPopup>
                                    {isOwner && !isDbPaused
                                        && [
                                            <MenuPopupItem
                                              key='transferOwnership'
                                              icon={ <MenuPopupAccountIcon /> }
                                              onClick={ dbPage.onTransferOwnership }
                                            >
                                                Transfer ownership
                                            </MenuPopupItem>,
                                            <MenuSeparator key='separator0' />,
                                        ]
                                    }
                                    {!isDbPaused
                                        && (
                                            <MenuPopupItem
                                              key='fundDatabase'
                                              icon={ <MenuPopupTransferIcon /> }
                                              onClick={ dbPage.onFundDb }
                                            >
                                                Fund database
                                            </MenuPopupItem>
                                        )
                                    }
                                    {isOwner && !isDbPaused
                                        && [
                                            <MenuPopupItem
                                              key='claimFunds'
                                              icon={ <MenuPopupTransferIcon /> }
                                              onClick={ dbPage.onClaimFunds }
                                            >
                                                Claim Funds
                                            </MenuPopupItem>,
                                            <MenuSeparator key='separator1' />,
                                            <MenuPopupItem
                                              key='pauseDB'
                                              icon={ <MenuPopupPauseIcon /> }
                                              onClick={ dbPage.onPauseDb }
                                            >
                                              Pause database
                                            </MenuPopupItem>,
                                        ]
                                    }
                                    {isDbPaused && isOwner
                                        && (
                                            <MenuPopupItem
                                              key='unpauseDB'
                                              icon={ <MenuPopupResumeIcon /> }
                                              onClick={ dbPage.onResumeDb }
                                            >
                                                Resume database
                                            </MenuPopupItem>
                                        )
                                    }
                                    {isDbPaused && isOwner
                                        && [
                                            <MenuSeparator key='separator2' />,
                                            <MenuPopupItem
                                              key='deleteDB'
                                              icon={ <MenuPopupDeleteIcon /> }
                                              onClick={ dbPage.onDeleteDb }
                                            >
                                              Delete database
                                            </MenuPopupItem>,
                                        ]
                                    }
                                </MenuPopup>
                            </DbMenu>
                        </FlexContainerRight>
                    </FlexContainer>
                </div>
            );
        }}
    </Subscribe>
);

export default Header;
