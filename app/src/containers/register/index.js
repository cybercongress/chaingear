import React, { Component } from 'react';

import getWeb3 from '../../utils/getWeb3.js';
import * as chaingear from '../../utils/chaingear'

const getItems = (contract, count, array, mapFn) => {
  return new Promise(resolve => {
    contract[count]().then(lengthData => {
      const length = lengthData.toNumber();
      let promises = [];
          for(let i =0; i < length; i++) {
            promises.push(contract[array](i));
          }

          Promise.all(promises).then(data => {
            const results = data.map(mapFn);
            resolve(results);
          })
    })
  })
}

const getItems2 = (contract, count, array, mapFn) => {
  return new Promise(resolve => {
    contract[count]((e, lengthData) => {
      console.log(e, lengthData)
      const length = lengthData.toNumber();
      let promises = [];
          for(let i =0; i < length; i++) {
            promises.push(new Promise((itemResolve, itemReject) => {
              contract[array](i, (e, r) => {
                if (e) itemReject(e)
                  else itemResolve(r);
              })
            }));
          }

          Promise.all(promises).then(data => {
            // .filter(arr => arr[0] !== '')
            const results = data.map(mapFn);
            resolve(results);
          })
    })
  })
}

const IPFS = require('ipfs-api');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });


const getContract = (address, abi) => {
  return new Promise(resolve => {
    getWeb3.then(({ web3 }) => {
      web3.eth.defaultAccount = web3.eth.accounts[0];
      const CoursetroContract = web3.eth.contract(abi);
      const contract = CoursetroContract.at(address);
      resolve({ web3, contract })
    })
  })
}
// import axios from "axios";


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
    chaingear.getContracts()
      .then(contracts => {
        var ipfsHash = contracts.filter(x => x.address === address)[0].ipfsHash;
        ipfs.get(ipfsHash, (err, files) => {
          const buf = files[0].content;
          var data = JSON.parse(JSON.parse(buf.toString()));
          var fields = data.filter(x => x.name === 'entries')[0].outputs;
          getContract(address, data)
          .then(({ contract }) => {
            this.contract = contract; 
             const mapFn = item => {
                  const aItem = Array.isArray(item) ? item : [item];
                  return fields.reduce((o, field, index) => {
                    o[field.name] = aItem[index]; 
                    return o;
                  },{})
              }
              getItems2(contract, 'entriesCount', 'entries', mapFn)
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

  add = () => {
    const newItem = {
      // id: guid()
    }
    const args = [];
    for(let key in this.refs) {
      if (this.refs[key]) {
        const field = this.state.fields.find(x => x.name === key);
        if (field.type === 'bool') {
          args.push(this.refs[key].checked);
        } else {
          args.push(this.refs[key].value);
        }
        newItem[key] = +this.refs[key].value          
      }
    }

    args.push(function(e, r){

    })

    this.contract.createEntry.apply(this.contract, args);   
    this.setState({
      newItem,
      loading: true
    })
  }

  removeItem = (id) => {
    this.contract.deleteEntry(id, function(e, r){

    });
    this.setState({
      loading: true
    })
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

    const bottom = fields.map(field => {
      let content = <input ref={field.name} />;
      if (field.type === 'bool') {
        content = <input ref={field.name} type='checkbox' />
      }
      return (
        <td key={field.name}>
          {content}
        </td>
      )
    })
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
            <tr key='add-row'>
              {bottom}
              <td key='button-cell'>
                <button onClick={this.add}>add</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}


export default Register;

