import React, { Component } from 'react';

import * as cyber from '../../utils/cyber'

import AddRow from './AddRow';

import { browserHistory } from 'react-router'
var moment = require('moment');


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
        cyber.init()
            .then(({ web3 }) => {
                cyber.getRegistry().then(({ items }) => {
                    const registries = items;
                    const registry = registries.find(x => x.address === address);
                    if (!registry) return;
                    
                    this.setState({
                        name: registry.name,
                        registrationTimestamp: registry.registrationTimestamp,
                        creator: registry.creator,
                        description: '???',
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
    // alert(1)

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
        alert('TODO')
    }

    changeTag = (tag) => {
        alert('TODO')
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
  
  render() {
    const { fields, items, loading, balance, isOwner } = this.state;

    if (loading) {
      return (
        <div>
          loading...
        </div>
      );
    }

    const head = fields.map(field => {
      return (
        <th key={field.name}>{field.name}</th>
      )
    })
    const rows = items.map((item, index) => {
      // const row = fields.map(field => {
      //   return (
      //     <td key={field.name}>
      //       <span>{item[field.name].toString()}</span>
      //     </td>
      //   )
      // })
      // return (
      //   <tr key={index}>
      //     {row}
      //     <td>
      //       <span>{item['currentEntryBalanceETH']}</span>

      //       <Dotate 
      //           onInter={(value) => this.clameRecord(index, value)}
      //           buttonLable='clame record'
      //       />
      //     </td>
      //     <td key='remove'>
      //       <button onClick={() => this.removeItemClick(index)}>remove</button>
      //       <Dotate onInter={(value) => this.fundEntryClick(index, value)}/>
      //     </td>
      //   </tr>
      // );
        return (
            <RegistryItem
              clameRecord={this.clameRecord}
              removeItemClick={this.removeItemClick}
              fundEntryClick={this.fundEntryClick}
              
              onUpdate={(values) => this.onUpdate(values, index)}

              fields={fields}
              item={item}
              index={index}
            />
        );
    });

    const {
        name,
        description,
        tag,
        registrationTimestamp,
        entryCreationFee,
        creator,
        entriesAmount,
        total_fee,
        funded
    } = this.state;

    return (
      <div>
        <div>
            <FormField
              label='Name'
              value={name}
              onUpdate={this.changeName}
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
              label='Created date'
              value={registrationTimestamp ? moment(new Date(registrationTimestamp.toNumber() * 1000)).format('DD-MM-YYYY') : ''}
            />
            <FormField
              label='create record fee'
              value={entryCreationFee}
              onUpdate={this.changeEntryCreationFee}
            />
            <FormField
              label='admin'
              value={creator}
            />
            <FormField
              label='Record count'
              value={entriesAmount}
            />
          </div>
          <div>
            total fee: {total_fee}
          </div>
          <div>
            funded: {funded}
          </div>
        {isOwner && <div>
          <div>Balance: {balance}</div>
          <button onClick={this.claim}>claim</button>
          <button onClick={this.removeContract}>remove</button>
        </div>}
        <table>
          <thead>
            <tr>
              {head}
              <th>balance</th>
              <th key='buttons'></th>
            </tr>
          </thead>
          <tbody>
            {rows}
            <button onClick={this.add}>add</button>
            
            {/*<AddRow
              key='add-row'
              onAdd={this.add}
              fields={fields}
            />*/}

          </tbody>
        </table>
      </div>
    );
  } 
}

class RegistryItem extends Component {
    state = {
        edit: false,
        data: {}
    }

    change = (e, name, type) => {
        console.log(type)
        if (type === 'int256' && isNaN(e.target.value)) return;

        if (type === 'uint256' && (isNaN(e.target.value) || +e.target.value < 0)) return;

        this.setState({
            data: {
                ...this.state.data,
                [name]: e.target.value
            }
        });
    }

    startEdit = () => {
        this.setState({
            edit: true
        })
    }

    cancel = () => {
        this.setState({
            edit: false
        })
    }

    update = () => {
        const {
          fields
        } = this.props;

        const newItem = {
          // id: guid()
        }
        const args = [];
        for(let key in this.refs) {
          if (this.refs[key]) {
            const field = fields.find(x => x.name === key);
            if (field.type === 'bool') {
              args.push(this.refs[key].checked);
            } else {
              args.push(this.state.data[key]);
            }
            newItem[key] = +this.refs[key].value          
          }
        }

        if (args.some(x => x === "" || x === undefined)) return ;

        this.props.onUpdate(args);
        this.setState({
            edit: false
        })
    }

    render() {
        const { 
            fields, item, index,
            clameRecord,
            removeItemClick,
            fundEntryClick
        } = this.props;

        const {
            edit
        } = this.state;

        let row = fields.map(field => {
            return (
                <td key={field.name}>
                    <span>{item[field.name].toString()}</span>
                </td>
            );
        });

        let button = (
            <button onClick={this.startEdit}>update</button>
        );

        if (edit) {
            row = fields.map(field => {
              let content = (
                <input 
                  ref={field.name} 
                  onChange={e => this.change(e, field.name, field.type)}
                  value={this.state[field.name]}
                />
              );
              if (field.type === 'bool') {
                content = <input ref={field.name}  type='checkbox' />
              }
              return (
                <td key={field.name}>
                  {content}
                </td>
              )
            });

            button = (
                <div>
                    <button onClick={this.update}>update</button>
                    <button onClick={this.cancel}>cancel</button>
                </div>
            );
        }
        return (
            <tr>
                {row}
                <td>
                <span>{item['currentEntryBalanceETH']}</span>

                <Dotate 
                    onInter={(value) => clameRecord(index, value)}
                    buttonLable='clame record'
                />
                </td>
                <td key='remove'>
                    <div>
                        {button}
                    </div>
                    <div>
                        <button onClick={() => removeItemClick(index)}>remove</button>
                    </div>
                    <div>
                        <Dotate onInter={(value) => fundEntryClick(index, value)}/>
                    </div>
                </td>
            </tr>
        );
    }
}

class FormField extends Component {
    state = {
        edit: false
    }

    startEdit = () => {
        // this.props.onStart();
        this.setState({ edit: true })
    }

    save = () => {
        const { onUpdate } = this.props;
        this.setState({ edit: false })
        onUpdate(this.refs.input.value)
    }

    cancel = () => {
        this.setState({ edit: false })        
    }

    render() {
        console.log(' render ')
        const { label, value, onUpdate } = this.props;
        const { edit } = this.state;

        return (
            <div>
                <span>{label}:</span>
                {!edit ? (<span>{value}</span>) : (<input ref='input' defaultValue={value}/>)}
                {onUpdate && (
                    <div>
                        {!edit ? (
                            <div>
                                <button onClick={this.startEdit}>Update</button>
                            </div>
                        ) : (
                            <div>
                                <button onClick={this.save}>save</button>
                                <button onClick={this.cancel}>cancel</button>
                            </div>
                        )}
                    </div>
                    
                )}
            </div>
        );
    }
}

class Dotate extends Component {
    state = {
        open: false,
    }
    fundEntryClick = () => {
        this.setState({
            open: true
        })
    }

    ok = () => {
        const value = this.refs.value.value;
        this.props.onInter(value);
        this.setState({
            open: false
        })

    }
    cancel = () => {
        this.setState({
            open: false
        })

    }
    render() {
        let buttonLable = this.props.buttonLable || 'fundEntry';

        const { open } = this.state;
        if (open) {
            return (
                <div style={{ display: 'inline-block'}}>
                    <input ref='value'/>
                    <button onClick={this.ok}>ok</button>
                    <button onClick={this.cancel}>cancel</button>
                </div>
            )
        }
        return (
            <button onClick={this.fundEntryClick}>{buttonLable}</button>
        );
    }
}


export default Register;

