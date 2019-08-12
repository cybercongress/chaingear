import React, { Component } from 'react';

import { Link } from 'react-router';

import {
    Section,
    SectionContent,
    Badge,
    FooterButton,
    Container,
    TextEv as Text,
    HomeTable,
    LinkHash,
    Button,
    ScrollContainer,
    MainContainer,
    LinkItem,
    Pane,
    CardHover,
    Pill,
    Vitalick,
} from '@cybercongress/ui';
import { getDatabases, getDefaultAccount, init } from '../../utils/cyber';
import { formatDate } from '../../utils/utils';

const DatabasesCard = ({
    title, description, to, ...props
}) => (
    <Link style={ { textDecoration: 'none' } } to={ to }>
        <CardHover
          flex={ 1 }
          paddingY={ 50 }
          display='flex'
          alignItems='center'
          flexDirection='column'
          backgroundColor='#000000'
          width='100%'
          { ...props }
        >
            <Text display='inline-block' marginBottom={ 15 } color='#4ed6ae' fontSize='30px'>
                {title}
            </Text>

            <Text display='inline-block' color='#4ed6ae'>
                {description}
            </Text>
        </CardHover>
    </Link>
);

const FooterCyb = () => (
    <Pane
      display='flex'
      alignItems='center'
      justifyContent='center'
      width='100%'
      position='absolute'
      bottom={ 0 }
      paddingY={ 20 }
      backgroundColor='#000000'
      zIndex={ 2 }
    >
        <Pane
          flexGrow={ 1 }
          maxWidth={ 1000 }
          display='flex'
          alignItems='center'
          justifyContent='center'
          flexDirection='row'
          paddingX='3vw'
        >
            <Pane display='flex' justifyContent='center' flexGrow={ 1 }>
                <Text color='#fff' fontSize='18px'>
                    Add a new database for 10 ETH
                </Text>
            </Pane>
            <LinkItem className='btn link-btn' to='#/new'>
                Add database
            </LinkItem>
        </Pane>
    </Pane>
);

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            databases: [],
            account: null,
        };
    }

    componentDidMount() {
        init()
            .then(() => getDefaultAccount())
            .then(account => this.setState({
                account: account.toLowerCase(),
            }))
            .then(() => getDatabases())
            .then(databases => this.setState({
                databases,
            }));
    }

    render() {
        const { databases, account } = this.state;

        const rows = databases.map(database => (
            // <tr key={ database.name }>
            //     <td>
            //         <Link to={ `/databases/${database.symbol}` }>{database.name}</Link>
            //     </td>
            //     <td>{database.symbol}</td>
            //     <td>{database.supply.toNumber()}</td>
            //     <td>{database.contractVersion}</td>
            //     <td>
            //         <LinkHash value={ database.admin } />
            //     </td>
            //     <td>{formatDate(database.createdTimestamp)}</td>
            // </tr>
            <DatabasesCard
              key={ database.name }
              title={ database.name }
              description={ database.symbol }
              to={ `/databases/${database.symbol}` }
            />
        ));

        const myRows = databases
            .filter(x => x.admin === account)
            .map(database => (
                // <tr key={ database.name }>
                //     <td>
                //         <Link to={ `/databases/${database.symbol}` }>{database.name}</Link>
                //     </td>
                //     <td>{database.symbol}</td>
                //     <td>{database.supply.toNumber()}</td>
                //     <td>{database.contractVersion}</td>
                //     <td>
                //         <LinkHash value={ database.admin } />
                //     </td>
                //     <td>{formatDate(database.createdTimestamp)}</td>
                // </tr>
                <DatabasesCard
                  key={ database.name }
                  title={ database.name }
                  description={ database.symbol }
                  to={ `/databases/${database.symbol}` }
                />
            ));

        let content = (
            <div>
                <Section
                  title={ (
                      <span>
                          <Text fontSize='20px' color='#fff'>
                                My databases
                          </Text>
                          {/* <Badge marginLeft={5}>{myRows.length}</Badge> */}
                      </span>
) }
                >
                    <Pane
                      display='flex'
                      width='100%'
                      alignItems='center'
                      justifyContent='space-around'
                      marginY='70px'
                    >
                        <Pane
                          width='250px'
                          height='250px'
                          boxShadow='0 0 10px 2px #03cba0'
                          borderRadius='50%'
                          display='flex'
                          alignItems='center'
                          justifyContent='space-around'
                        >
                            <Pane
                              width='73px'
                              height='37px'
                              transform='rotate(25deg)'
                              boxShadow='0 0 6px 2px #03cba0'
                              borderRadius='50%'
                              marginBottom='20px'
                            />
                            <Pane
                              width='73px'
                              height='37px'
                              transform='rotate(-25deg)'
                              boxShadow='0 0 6px 2px #03cba0'
                              borderRadius='50%'
                              marginBottom='20px'
                            />
                        </Pane>
                        <Text fontSize='20px' color='#fff'>
                            You haven&#39;t created databases yet!
                        </Text>
                    </Pane>
                </Section>
            </div>
        );

        if (myRows.length > 0) {
            content = (
                <div>
                    <Section
                      title={ (
                          <Pane display='flex' alignItems='flex-end'>
                              <Text fontSize='20px' color='#fff'>
                                    My databases
                              </Text>
                              <Pill
                                isSolid
                                marginLeft={ 5 }
                                backgroundColor='#000000'
                                style={ { color: '#03cba0' } }
                                boxShadow='0 0 4px 0px #03cba0'
                                width='25px'
                              >
                                  {myRows.length}
                              </Pill>
                          </Pane>
) }
                    >
                        {/* <SectionContent>
                            <HomeTable>
                                <thead>
                                    <tr>
                                        <th>NAME</th>
                                        <th>SYMBOL</th>
                                        <th>ENTRIES</th>
                                        <th>VERSION</th>
                                        <th>ADMIN</th>
                                        <th>CREATED</th>
                                    </tr>
                                </thead>
                                <tbody> */}
                        <Pane
                          width='100%'
                          display='grid'
                          gridTemplateColumns='repeat(auto-fit, minmax(200px, 0.5fr))'
                          gridGap='1.5rem'
                          marginTop='20px'
                          marginBottom='40px'
                        >
                            {myRows}
                        </Pane>
                        {/* </tbody>
                            </HomeTable> */}
                        {/* </SectionContent> */}
                    </Section>
                </div>
            );
        }

        return (
            <span>
                <ScrollContainer style={ { height: '100vh' } }>
                    <MainContainer>
                        {/* <div>{content}</div> */}

                        {/* <Section
                      title={ (
                          <span>
                              <span>chaingear databases</span>
                              <Badge>{rows.length}</Badge>
                          </span>
) }
                    >
                        <SectionContent>
                            <HomeTable>
                                <thead>
                                    <tr>
                                        <th>NAME</th>
                                        <th>SYMBOL</th>
                                        <th>ENTRIES</th>
                                        <th>VERSION</th>
                                        <th>ADMIN</th>
                                        <th>CREATED</th>
                                    </tr>
                                </thead>
                                <tbody>{rows}</tbody>
                            </HomeTable>
                        </SectionContent>
                    </Section> */}
                        <Pane display='flex' flexDirection='column'>
                            {content}
                            {/* <HomeTable>
                                <thead>
                                    <tr>
                                        <th>NAME</th>
                                        <th>SYMBOL</th>
                                        <th>ENTRIES</th>
                                        <th>VERSION</th>
                                        <th>ADMIN</th>
                                        <th>CREATED</th>
                                    </tr>
                                </thead>
                                <tbody> */}
                            <Section
                              title={ (
                                  <Pane display='flex' alignItems='flex-end'>
                                      <Text fontSize='20px' color='#fff'>
                                            chaingear databases
                                      </Text>
                                      <Pill
                                        isSolid
                                        marginLeft={ 5 }
                                        backgroundColor='#000000'
                                        style={ { color: '#03cba0' } }
                                        boxShadow='0 0 4px 0px #03cba0'
                                        width='25px'
                                      >
                                          {rows.length}
                                      </Pill>
                                  </Pane>
) }
                            >
                                <Pane
                                  width='100%'
                                  display='grid'
                                  gridTemplateColumns='repeat(auto-fit, minmax(200px, 0.5fr))'
                                  gridGap='1.5rem'
                                  marginTop='20px'
                                  marginBottom='40px'
                                >
                                    {rows}
                                </Pane>
                            </Section>
                            {/* </tbody>
                            </HomeTable> */}
                        </Pane>
                    </MainContainer>
                </ScrollContainer>
                <FooterCyb />
            </span>
        );
    }
}

export default Home;
