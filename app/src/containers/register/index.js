import React, { Component } from 'react';

import * as cyber from '../../utils/cyber'

import AddRow from './AddRow';

class Register extends Component {
    
    state = {
      items: [],
      fields: [],
      newItem: {},
      loading: false
    }
  
  componentDidMount() {
    this.setState({
      loading: true
    })
    const address = this.props.params.adress;
    cyber.getContracts()
      .then(contracts => {
        var ipfsHash = contracts.filter(x => x.address === address)[0].ipfsHash;
        cyber.ipfs.get(ipfsHash, (err, files) => {
          const buf = files[0].content;
          var data = JSON.parse(JSON.parse(buf.toString()));
          // console.log(JSON.parse(buf.toString()))
          var fields = data.filter(x => x.name === 'entries')[0].outputs;
          fields = fields.filter(x => x.name != 'owner' && x.name != 'lastUpdateTime');
          cyber.getContractByAbi(address, data)
          .then(({ contract, web3 }) => {
            this.contract = contract; 
            this.web3 = web3;
             const mapFn = item => {
                  const aItem = Array.isArray(item) ? item : [item];
                  return fields.reduce((o, field, index) => {
                    o[field.name] = aItem[index]; 
                    return o;
                  },{})
              }
              cyber.getItems2(contract, 'entriesCount', 'entries', mapFn)
                .then(items => {
                  this.setState({ 
                    items, fields ,
                    loading: false
                  })
                });
          })
        });     
      })
  }

  deleted = (e, result) => {
    const index = result.args.entryId.toNumber();
    this.setState({
      items: this.state.items.filter((x, i) => i !== index),
      loading: false
    })
  }

  created = (error, result) => {
    const newItem = {
      ...this.state.newItem,

    }
    this.setState({
      items: this.state.items.concat(newItem),
      loading: false
    })
  } 

  add = (args) => {
    this.contract.entryCreationFee.call((e, data) => {
      var value = data.toString()

      args.push({
        value: data
      })

      args.push(function(e, r){

      })

      this.contract.createEntry.apply(this.contract, args);   
    });
  }

  removeItem = (id) => {
    this.contract.deleteEntry(id, function(e, r){

    });
    // this.setState({
    //   loading: true
    // })
  }

  validate = (e) => {
    e.preventDefault();
    console.log(e.target.value)
  }
  
  render() {
    const { fields, items, loading } = this.state;

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
      const row = fields.map(field => {
        return (
          <td key={field.name}>
            <span>{item[field.name].toString()}</span>
          </td>
        )
      })
      return (
        <tr key={index}>
          {row}
          <td key='remove'>
            <button onClick={() => this.removeItem(item.id)}>remove</button>
          </td>
        </tr>
      );
    });


    return (
      <div>
        <table>
          <thead>
            <tr>
              {head}
              <th key='buttons'></th>
            </tr>
          </thead>
          <tbody>
            {rows}
            <AddRow
              key='add-row'
              onAdd={this.add}
              fields={fields}
            />
          </tbody>
        </table>
      </div>
    );
  }
}


export default Register;

