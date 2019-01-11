import React from 'react';
import { Subscribe } from 'unstated';
import {
    ActionLink, Section, DbHeader,
    DbHeaderLeft, DbHeaderRight, DbHeaderLine,
    DbMenu, MenuPopup, MenuPopupItem, MenuSeparator,
    MenuPopupDeleteIcon, MenuPopupEditIcon, MenuPopupTransferIcon,
    MenuPopupResumeIcon, MenuPopupPauseIcon,
    PageTitle, ProgressBar, CircleLable,
} from '@cybercongress/ui';

import page from './page';

const Header = () => (
    <Subscribe to={ [page] }>
        {(dbPage) => {
            const {
                isOwner, isSchemaExist, databaseSymbol, isDbPaused, name,
            } = dbPage.state;

            return (
                <div>
                    <Section>
                        <div style={ { marginLeft: '15px' } }>
                            <ActionLink to='/'>BACK TO CHAINGEAR</ActionLink>
                            {!isSchemaExist && isOwner
                                && (
                                    <ActionLink
                                      style={ { marginLeft: 15 } }
                                      to={ `/schema/${databaseSymbol}` }
                                    >
                                        Define schema
                                    </ActionLink>
                                )
                            }
                        </div>
                    </Section>

                    <DbHeader>
                        <PageTitle>{name}</PageTitle>

                        {!isSchemaExist
                            && (
                                <ProgressBar>
                                    <CircleLable type='complete' number='1' text='Registry initialization' />
                                    <CircleLable number='2' text='Schema definition' />
                                </ProgressBar>
                            )
                        }
                        <DbHeaderLine>
                            <DbHeaderLeft>{`symbol: ${databaseSymbol}`}</DbHeaderLeft>

                            <DbHeaderRight>
                                { `status: ${isDbPaused ? 'paused' : 'operational'}` }
                                <DbMenu>
                                    <MenuPopup>
                                        {isOwner && !isDbPaused
                                            && [
                                                <MenuPopupItem
                                                  key='transferOwnership'
                                                  icon={ <MenuPopupTransferIcon /> }
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
                                                  key='fundRegistry'
                                                  icon={ <MenuPopupEditIcon /> }
                                                  onClick={ dbPage.onFundDb }
                                                >
                                                    Fund registry
                                                </MenuPopupItem>
                                            )
                                        }
                                        {isOwner && !isDbPaused
                                            && [
                                                <MenuPopupItem
                                                  key='claimFunds'
                                                  icon={ <MenuPopupEditIcon /> }
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
