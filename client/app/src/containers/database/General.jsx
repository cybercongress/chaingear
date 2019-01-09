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
const moment = require('moment');

import page from './page';

const General = () => (
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
                <Section title='General'>
                  <SectionContent style={ { width: '25%' } }>
                      <CentredPanel>
                          <BoxTitle>Created:</BoxTitle>
                          <div>
                              {createdTimestamp ? moment(new Date(createdTimestamp.toNumber() * 1000)).format('DD/MM/YYYY hh:mm:ss') : ''}
                          </div>
                      </CentredPanel>
                  </SectionContent>

                  <SectionContent style={ { width: '25%' } }>
                      <CentredPanel>
                          <BoxTitle>Admin:</BoxTitle>
                          <div>
                              <LinkHash value={ admin } />
                          </div>
                      </CentredPanel>
                  </SectionContent>

                  <SectionContent style={ { width: '25%' } }>
                      <CentredPanel>
                          <BoxTitle>FUNDED:</BoxTitle>
                          <FundContainer>
                              <span>{funded} ETH</span>
                          </FundContainer>
                      </CentredPanel>
                  </SectionContent>

                  <SectionContent style={ { width: '25%' } }>
                      <CentredPanel>
                          <BoxTitle>FEES:</BoxTitle>
                          <FundContainer>
                              <span>{totalFee} ETH</span>
                          </FundContainer>
                      </CentredPanel>
                  </SectionContent>
              </Section>
	        );
        }}
    </Subscribe>
);

export default General;
