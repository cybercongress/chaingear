import React from 'react';
import { hashHistory } from 'react-router';
import { Subscribe } from 'unstated';
import {
    DbMenu,
    MenuPopup,
    MenuPopupItem,
    MenuSeparator,
    MenuPopupDeleteIcon,
    MenuPopupAccountIcon,
    MenuPopupTransferIcon,
    MenuPopupResumeIcon,
    MenuPopupPauseIcon,
    PageTitle,
    ProgressBar,
    CircleLable,
    Section,
    PopupBar,
    PopupBarFooter,
    FlexContainer,
    FlexContainerLeft,
    FlexContainerRight,
    LinkHash,
    MainContainer,
    StructureContainer,
    Structure,
    FormField,
    calculateBensShares,
    InfoButton,
    DatabaseItemsContainer,
    Select,
    ScrollContainer,
    CardHover,
    Avatar,
    Pane,
    TextEv as Text,
    Menu,
    Popover,
    Button,
    IconButton,
    Pill,
    Table,
    TextInput,
    LinkItem,
} from '@cybercongress/ui';

import page from './page';

const Header = () => (
    <Subscribe to={ [page] }>
        {(dbPage) => {
            const {
                isOwner,
                isSchemaExist,
                databaseSymbol,
                isDbPaused,
                name,
                totalFee,
            } = dbPage.state;

            const onDefineSchemaClick = () => {
                hashHistory.push(`/schema/${databaseSymbol}`);
            };

            const transferOwnershipDisabled = totalFee === 0;

            return (
                <div>
                    <Section>
                        <div style={ { marginLeft: '0', display: 'flex' } }>
                            <LinkItem
                              className='btn link-btn'
                              to='/'
                            >
                                back to chaingear
                            </LinkItem>
                            <Button
                                // transparent='true'
                              height='42px'
                              fontSize='16px'
                              minWidth='215px'
                              display='inline-block'
                              marginLeft={ 10 }
                              className='btn'
                              onClick={ () => onDefineSchemaClick(databaseSymbol) }
                            >
                                complete step
                            </Button>
                        </div>
                    </Section>

                    {/* <PageTitle>{name}</PageTitle> */}

                    {/* {!isSchemaExist && isOwner
                        && (
                            <ProgressBar>
                                <CircleLable type='complete' number='1' text='Database initialization' />
                                <CircleLable number='2' text='Schema definition'>
                                    <PopupBar>
                                        <Text lineheight>
                                            To operate with records, please, define schema
                                        </Text>
                                        <PopupBarFooter>

                                        </PopupBarFooter>
                                    </PopupBar>
                                </CircleLable>
                            </ProgressBar>
                        )
                    } */}
                    <Pane display='flex' alignItems='center' marginBottom={ 8 }>
                        <Pane display='flex' alignItems='baseline' flexGrow={ 1 }>
                            <Pill
                              height={ 6 }
                              width={ 6 }
                              borderRadius='50%'
                              backgroundColor={ isDbPaused ? '#f5a623' : '#3ab793' }
                              paddingX={ 0 }
                              isSolid
                              marginRight={ 10 }
                            />
                            <Text color={ isDbPaused ? '#f5a623' : '#50e3c2' }>{databaseSymbol}</Text>
                        </Pane>
                        {(!isDbPaused || isOwner) && (
                            <Popover
                              position='BOTTOM_LEFT'
                              content={ (
                                  <Menu>
                                      <Menu.Group>
                                          {isOwner && isDbPaused && (
                                          <span>
                                              <Menu.Item
                                                icon='people'
                                                onClick={ dbPage.onTransferOwnership }
                                                disabled={ transferOwnershipDisabled }
                                              >
                                                        Transfer Ownership
                                              </Menu.Item>
                                              <Menu.Divider />
                                          </span>
                                            )}
                                          {!isDbPaused && (
                                          <Menu.Item
                                            icon='exchange'
                                            onClick={ dbPage.onFundDb }
                                          >
                                                    Fund Registry
                                          </Menu.Item>
                                            )}
                                          {isOwner && !isDbPaused && (
                                          <span>
                                                    )
                                              <Menu.Item icon='exchange'>Claim Fee</Menu.Item>
                                              <Menu.Item
                                                icon='exchange'
                                                onClick={ dbPage.onClaimFunds }
                                              >
                                                        Claim Funds
                                              </Menu.Item>
                                              <Menu.Divider />
                                              <Menu.Item
                                                icon='pause'
                                                intent='#d32f2f'
                                                onClick={ dbPage.onPauseDb }
                                              >
                                                        Pause Regisrty
                                              </Menu.Item>
                                          </span>
                                            )}
                                          {isDbPaused && isOwner && (
                                          <Menu.Item
                                            icon='play'
                                            intent='#438cef'
                                            onClick={ dbPage.onResumeDb }
                                          >
                                                    Resume Registry
                                          </Menu.Item>
                                            )}
                                          {isDbPaused && isOwner && (
                                          <span>
                                              <Menu.Divider />
                                              <Menu.Item
                                                icon='trash'
                                                onClick={ dbPage.onDeleteDb }
                                              >
                                                        Delete
                                              </Menu.Item>
                                          </span>
                                            )}
                                      </Menu.Group>
                                  </Menu>
) }
                            >
                                <IconButton
                                  appearance='minimal'
                                  className='icon-btn color-white-svg'
                                  icon='settings'
                                  iconSize={ 18 }
                                />
                            </Popover>
                        )}
                    </Pane>
                    <Pane
                      width='100%'
                      height={ 2 }
                      boxShadow='inset 0 0 1px #fff'
                      marginBottom={ 40 }
                    />
                    {/* <FlexContainer line>
                        <FlexContainerLeft>{`symbol: ${databaseSymbol}`}</FlexContainerLeft>

                        <FlexContainerRight>
                            { `status: ${isDbPaused ? 'paused' : 'operational'}` }
                            {(!isDbPaused || isOwner) && (
                                <DbMenu>
                                    <MenuPopup>
                                        {isOwner && isDbPaused && [
                                            <MenuPopupItem
                                              key='transferOwnership'
                                              disabled={ transferOwnershipDisabled }
                                              icon={ <MenuPopupAccountIcon /> }
                                      isDbPaused        onClick={ dbPage.onTransferOwnership }
                                            >
                                                Transfer ownership
                                            </MenuPopupItem>,
                                            <MenuSeparator key='separator0' />,
                                        ]}
                                        {!isDbPaused && (
                                            <MenuPopupItem
                                              key='fundDatabase'
                                              icon={ <MenuPopupTransferIcon /> }
                                              onClick={ dbPage.onFundDb }
                                            >
                                                Fund database
                                            </MenuPopupItem>
                                        )}
                                        {isOwner && !isDbPaused && [
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
                                        ]}
                                        {isDbPaused && isOwner && (
                                            <MenuPopupItem
                                              key='unpauseDB'
                                              icon={ <MenuPopupResumeIcon /> }
                                              onClick={ dbPage.onResumeDb }
                                            >
                                                Resume database
                                            </MenuPopupItem>
                                        )}
                                        {isDbPaused && isOwner && [
                                            <MenuSeparator key='separator2' />,
                                            <MenuPopupItem
                                              key='deleteDB'
                                              icon={ <MenuPopupDeleteIcon /> }
                                              onClick={ dbPage.onDeleteDb }
                                            >
                                                Delete database
                                            </MenuPopupItem>,
                                        ]}
                                    </MenuPopup>
                                </DbMenu>
                            )}
                        </FlexContainerRight>
                    </FlexContainer> */}
                </div>
            );
        }}
    </Subscribe>
);

export default Header;
