import React, { Component } from 'react';

import * as cyber from '../../utils/cyber'


import { browserHistory } from 'react-router'
var moment = require('moment');


import { 
    Container,
    AddItemButton,
    AddItemButtonText,

    Section,
    SectionContent,

    Centred,

    Button,

    FundContainer,
    BoxTitle
} from '../../components/chaingear/'

import { RegistryItem, RegistryList } from './RegistryItem';
import ValueInput from '../../components/ValueInput';
import FormField from './FormField';
import QRCode from '../../components/QRCode/';
import Robohash from '../../components/Robohash/';
import { LinkHash } from '../../components/LinkHash/'

class Register extends Component {
    
    state = {
      items: [],
      fields: [],
      registries: [],
      newItem: {},
      loading: false,
      balance: null,
      isOwner: false,
      total_fee: 0,
      funded: '???',

      registryContract: null,
      web3: null,

       name: '',
       description: '',
       tag: '',
       registrationTimestamp: null,
       entryCreationFee: 0,
       entriesAmount: 0,
      creator: ''

    }
  
  componentDidMount() {
    this.setState({
      loading: true
    })


        const address = this.props.params.adress;

        

        // const address = this.props.params.adress;
        cyber.init()
            .then(({ web3 }) => {
                cyber.getRegistry().then(({ items }) => {

                    var registryID = this.getRegistryID(items);
                    // alert(registryID)
                    cyber.getContract().then(({ contract, web3 }) => {
                        // contract.paused((e, data) => {
                        //     debugger
                        // })
                        console.log('items ', items);
                        console.log('registryID ', registryID);
                        contract.registryBalanceInfo(registryID, (e, data) => {
                            var funded = web3.fromWei(web3.toDecimal(data[0].toNumber()));
            //                this.componentDidMount();
                            this.setState({
                                funded
                            })
                        })
                    })


                    const registries = items;
                    const registry = registries.find(x => x.address === address);
                    if (!registry) return;
                    
                    this.setState({
                        name: registry.name,
                        registrationTimestamp: registry.registrationTimestamp,
                        creator: registry.creator,
                        tag: 'TODO',
                        web3: web3
                    })
                    const r = cyber.getRegistryByAddress(registry.address);
                    web3.eth.getBalance(registry.address, (e, balance) => {
                        balance = web3.fromWei(web3.toDecimal(balance), 'ether');
                        this.setState({
                            total_fee: balance
                        })
                    });
                    
                    r.getRegistryDescription((e, description) => {
                        this.setState({
                            description
                        })
                    });

                    // r.getRegistryTags((e, data) => {
                    //     debugger
                    // })

                    r.getInterfaceEntriesContract((e, ipfsHash) => {
                        r.getEntryCreationFee((e, data) => {
                            var fee = web3.fromWei(data, 'ether').toNumber();


                            this.setState({
                                entryCreationFee: fee,
                                registryContract: r
                            })
                            cyber.getFieldByHash(ipfsHash)
                                .then(({ abi, fields }) => {

                                    cyber.getRegistryData(address, fields, abi)
                                    .then(({ fee, items, fields }) => {
                                        Promise.all(
                                            items.map((i, index) => new Promise((resolve, reject) => r.getEntryMeta(index, (e, data) => resolve(data))))
                                        ).then(data => {
                                            var _items = items.map((item, index) => {                                        
                                            var currentEntryBalanceETH = web3.fromWei(data[index][4]).toNumber();
                                                return {
                                                    ...item, 
                                                    currentEntryBalanceETH
                                                }
                                            });

                                            this.setState({ 
                                                items: _items, 
                                                fields, 
                                                registries,
                                                entriesAmount: items.length,
                                                loading: false 
                                            });
                                        });
                                    });
                                })                            
                        });
                    })
        
                })  
              
            }) 


  }

  deleted = (e, result) => {
    const index = result.args.entryId.toNumber();
    this.setState({
      items: this.state.items.filter((x, i) => i !== index),
      loading: false
    })
  }


  add = (values) => {
    // cyber.addRegistryItem(this.contract, args);
    const { registries } = this.state;
    const address = this.props.params.adress;
    const registry = registries.find(x => x.address === address);
    if (!registry) return;
    const r = cyber.getRegistryByAddress(registry.address);
    r.getInterfaceEntriesContract((e, ipfsHash) => {
        // const ipfsHash = registry.ipfsHash;
        cyber.addItem(address)
            .then((entryId) => {
                this.componentDidMount();
                // return cyber.updateItem(address, ipfsHash, entryId, values)
            }) 
    });
  }

  onUpdate = (values, entryId) => {
    const { registries } = this.state;
    const address = this.props.params.adress;
    const registry = registries.find(x => x.address === address);
    if (!registry) return;
    const r = cyber.getRegistryByAddress(registry.address);
    r.getInterfaceEntriesContract((e, ipfsHash) => {
        // const ipfsHash = registry.ipfsHash;
        cyber.updateItem(address, ipfsHash, entryId, values)
            .then((entryId) => {
                this.componentDidMount();
                // return cyber.updateItem(address, ipfsHash, entryId, values)
            }) 
    });
  }

  removeItemClick = (id) => {

    this.setState({ loading: true})
    const address = this.props.params.adress;
    cyber.removeItem(address, id)
        .then(() => {
            const newItems = this.state.items.filter((item, index) => index !== id);
            this.setState({ items: newItems, loading: false })
        })
    // alert(id)
    // this.contract.deleteEntry(id, function(e, r){

    // });
    // this.setState({
    //   loading: true
    // })
  }


  validate = (e) => {
    e.preventDefault();
    console.log(e.target.value)
  }

  claim = () => {
    this.contract.claim((e, d) => {
      this.setState({ balance: 0 })
    })
  }

    removeContract = () => {    
        const address = this.props.params.adress;
        cyber.removeRegistry(address).then(() => {
          this.contract.destroy((e, d) => {
            browserHistory.push(`/`);  
          })      
        });
    }

    fundEntryClick = (index, value) => {
        this.setState({ loading: true })
        const address = this.props.params.adress;
        cyber.fundEntry(address, index, value)
            .then(() => {
                this.setState({ loading: false })
            })
    }

    changeName = (name) => {
        alert('TODO')
    }

    changeDescription = (description) => {
        this.state.registryContract.updateRegistryDescription(description, (e, data) => {
            this.setState({
                description
            })
        })
    }

    changeTag = (tag) => {
        this.state.registryContract.addRegistryTag(tag, () => {
            this.setState({
                tag: tag
            })
        })
    }

    changeEntryCreationFee = (entryCreationFee) => {
        const address = this.props.params.adress;
        cyber.updateEntryCreationFee(address, entryCreationFee)
    }

    clameRecord = (entryID, amount) => {
        this.state.registryContract.claimEntryFunds(entryID, this.state.web3.toWei(amount, 'ether'), (e, data) => {
            this.componentDidMount();
        })
    }
    getRegistryID = (registries) => {
        const address = this.props.params.adress;

        let index = null;
        (registries || this.state.registries).forEach((reg, _index) => {
            if (reg.address === address){
                index = _index;
            }
        });

        return index;
    }
    fundRegistry = (amount) => {
        var registryID = this.getRegistryID();
        alert(registryID);
        cyber.getContract().then(({ contract, web3 }) => {
            contract.fundRegistry(registryID, { value: web3.toWei(amount, 'ether') }, (e, data) => {
                this.componentDidMount();
            })
            
        })

    }

    clameRegistry = (amount) => {
        var registryID = this.getRegistryID();
        cyber.getContract().then(({ contract, web3 }) => {
            contract.claimEntryFunds(registryID, web3.toWei(amount, 'ether'), (e, data) => {
                this.componentDidMount();
            })
        })
    }

    clameFee = (amount) => {
        this.state.registryContract.claim((e, data) => {
            debugger
        })
    }
  
  render() {
    const { fields, items, loading, balance, isOwner } = this.state;

    if (loading) {
      return (
        <div>
          loading...
        </div>
      );
    }

    const rows = items.map((item, index) => {

        return (
            <RegistryItem
              clameRecord={this.clameRecord}
              removeItemClick={this.removeItemClick}
              fundEntryClick={this.fundEntryClick}
              
              onUpdate={(values) => this.onUpdate(values, index)}

              fields={fields}
              item={item}
              index={index}
              key={index}
            />
        );
    });
    const address = this.props.params.adress;

    const {
        name,
        description,
        registrationTimestamp,
        entryCreationFee,
        creator,
        entriesAmount,
        total_fee,
        funded,
        tag
    } = this.state;

    return (
      <div>
        <Container>
        <Section title='General'>
            <SectionContent style={{ width: '25%' }}>
                <Centred>
                    <Robohash hash={address} />
                </Centred>
            </SectionContent>

            <SectionContent style={{ width: '25%' }}>
                <Centred>
                <BoxTitle>
                    Created:
                </BoxTitle>
                <div style={{ height: 100, color: '#7c7c7c' }}>
                    {registrationTimestamp ? moment(new Date(registrationTimestamp.toNumber() * 1000)).format('DD/MM/YYYY mm::hh:ss') : ''}
                </div>
                </Centred>
            </SectionContent>

            <SectionContent style={{ width: '25%' }}>
                <Centred>
                    <BoxTitle>creator:</BoxTitle>
                    <div style={{ height: 100 }}>
                        <LinkHash  value={creator} />
                    </div>
                </Centred>
            </SectionContent>

            <SectionContent style={{ width: '25%' }}>
                <Centred>
                <BoxTitle>
                    FUNDED/FEES:
                </BoxTitle>

                <FundContainer>
                    <span>
                    {total_fee} ETH
                    </span>
                    <Button style={{ width: 119 }} onClick={this.clameFee}>clame fee</Button>
                </FundContainer>
                <FundContainer>
                    <span>
                    {funded} ETH
                    </span>

                    <ValueInput 
                        onInter={this.clameRegistry}
                        buttonLable='claim funds'
                        color='second'
                    />
                
                </FundContainer>
                </Centred>
            </SectionContent>            
        </Section>

        <Section title='Overview'>
            <SectionContent grow={0} style={{ width: '25%'}}>
                <Centred>
                <div>
                    <QRCode hash={address} size={160} />
                </div>
                <ValueInput 
                    onInter={this.fundRegistry}
                    buttonLable='fund registry'
                    width='100%'
                />
                </Centred>
            </SectionContent>

            <SectionContent grow={3}>
                <FormField
                  label='Name'
                  value={name}
                  onUpdate={this.changeName}
                />
                <FormField
                  label='Symbol'
                  value={'R1'}
                />
                <FormField
                  label='Description'
                  value={description}
                  onUpdate={this.changeDescription}
                />
                <FormField
                  label='Tag'
                  value={tag}
                  onUpdate={this.changeTag}
                />
                <FormField
                  label='Entries'
                  value={rows.length}
                />
                <FormField
                  label='fee'
                  value={entryCreationFee}
                  onUpdate={this.changeEntryCreationFee}
                />                
            </SectionContent>        
        </Section>

                         
        <RegistryList>
            {rows}
        </RegistryList>
        
        </Container>
        <AddItemButton onClick={this.add}>
            <AddItemButtonText>Add Record</AddItemButtonText>
            <span>Fee: {entryCreationFee} ETH</span>
        </AddItemButton>
      </div>
    );
  } 
}



export default Register;

