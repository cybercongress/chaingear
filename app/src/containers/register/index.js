// import React, { Component } from 'react';

// import guid from '../../utils/guid';
// import * as api from '../../utils/api';

// class Register extends Component {
//    constructor(props) {
//      super(props)

//      this.state = {
//        fields: [],
//        items: []
//      }
//    }
  
//  componentDidMount() {
//    const { adress } = this.props.params;
//    api.getContractByAddress(adress)
//      .then(contract => {
//        this.setState({
//          fields: contract.fields,
//          items: contract.items 
//        })
//      })
//  }

//  add = () => {
//    const newItem = {
//      id: guid()
//    }
//    for(let key in this.refs) {
//      if (this.refs[key]) {
//        newItem[key] = this.refs[key].value       
//      }
//    }

//    const items = this.state.items.concat(newItem);

//    this.setState({
//      items
//    });

//    const { adress } = this.props.params;
//    api.updateContactItems(adress, items)
//  }

//  removeItem = (id) => {
//    const { adress } = this.props.params;

//    const items = this.state.items.filter(x => x.id !== id);

//    this.setState({
//      items
//    });
//    api.updateContactItems(adress, items)
//  }
  
//  render() {
//    const { fields, items } = this.state;

//    const head = fields.map(field => {
//      return (
//        <th key={field.name}>{field.name}</th>
//      )
//    })
//    const rows = items.map(item => {
//      const row = fields.map(field => {
//        return (
//          <td key={field.name}>{item[field.name]}</td>
//        )
//      })
//      return (
//        <tr key={item.id}>
//          {row}
//          <td key='remove'>
//            <button onClick={() => this.removeItem(item.id)}>remove</button>
//          </td>
//        </tr>
//      );
//    });

//    const bottom = fields.map(field => {
//      return (
//        <td key={field.name}>
//          <input ref={field.name} />
//        </td>
//      )
//    })
//    return (
//      <div>
//        <table>
//          <thead>
//            <tr>
//              {head}
//              <th key='buttons'></th>
//            </tr>
//          </thead>
//          <tbody>
//            {rows}
//            <tr>
//              {bottom}
//              <td>
//                <button onClick={this.add}>add</button>
//              </td>
//            </tr>
//          </tbody>
//        </table>
//      </div>
//    );
//  }
// }


// export default Register;
// import getWeb3 from '../../utils/getWeb3.js';
import React, { Component } from 'react';

import getWeb3 from '../../utils/getWeb3.js';
import * as chaingear from '../../utils/chaingear'

const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')



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





// async function test() {
//  let t = axios.get('/test');
//  return t;
// }
const ipfsOptions = {
  repo: '/orbitdb/chaingear/0.0.1',
  EXPERIMENTAL: {
    pubsub: true
  },
}

// https://github.com/orbitdb/example-orbitdb-todomvc/blob/master/src/store.js

const getAbi = (address) => 
  new Promise(resolve => {
    
    const ipfs = new IPFS(ipfsOptions);
    const orbitdb = new OrbitDB(ipfs)

    ipfs.on('ready', () => {
      orbitdb.keyvalue('chaingear.abis', '/zzzz')
        .then(db => {
          console.log(db.address.toString())
          db.load().then(() => {
            var data = db.get(address)
            resolve(data);
          })
          // var data = db.get(address)
          // debugger
          // resolve(data);
        })
        // .then((db) => {
        //  var data = db.get(address)
        //  resolve(data);
        // })
        // .then((x, b) => {
        //  debugger
        //  resolve(x);
        // })
    //  // debugger
    //  // ipfs.object.put(address, { enc: 'json' }, (err, node) => {
    //  // debugger

    //  // })
    // //   debugger
    //   const orbitdb = new OrbitDB(ipfs);
    //   orbitdb.keyvalue('chaingear.abis')
    //    .then(db => {
    //      debugger
    //      return db.set(address, abi);
    //    })
    //    .then(s => {
    //      debugger
    //      resolve();
    //    });
    })    
  })



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
    constructor(props) {
      super(props)

      this.state = {
        items: [],
        fields: [],
        newItem: {},
        loading: false
      }
    }
  
  componentDidMount() {
    
    const address = this.props.params.adress;

    chaingear.getContracts()
      .then(contracts => {
          getAbi(address)
            .then(data => {
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
                    items, fields 
                  })
                });

              contract.EntryCreated().watch(this.created);
              contract.EntryDeleted().watch(this.deleted)
            });
            })        
      })

 

  }

  deleted = (e, result) => {
    debugger
    const index = result.args.entryId.toNumber();
    this.setState({
      items: this.state.items.filter((x, i) => i !== index),
      loading: false
    })
  }

  created = (error, result) => {
    // result.args.entryId.toNumber()
    // console.log(' >> ', this.state.items.concat(this.state.newItem))
    const newItem = {
      ...this.state.newItem,

    }
    debugger
    // debugger
    this.setState({
      items: this.state.items.concat(newItem),
      loading: false
    })
  } 

  add = () => {
    const newItem = {
      // id: guid()
    }
    // for(let key in this.refs) {
    //  if (this.refs[key]) {
    //    newItem[key] = this.refs[key].value       
    //  }
    // }
    // this.contract.createEntry(newItem.name, newItem.ticker);
    const args = [];
    for(let key in this.refs) {
      if (this.refs[key]) {
        args.push(this.refs[key].value);
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
   //    getWeb3
   //    .then(results => {
    //  const contract = require('truffle-contract');
    //  const registryContract = contract(RegistryContract);
    //  registryContract.setProvider(results.web3.currentProvider)
    //  registryContract.deployed().then(contract => {
    //    contract.createEntry(
    //      newItem.name, 
    //      newItem.tiker,
    //      {from: results.web3.eth.accounts[0], gas: 3000000, value: 1 }
    //    ).then(x => {
    //      // debugger
    //    })
    //    // contract.entriesCount().then(lengthData => {
    //    //  const length = lengthData.toNumber();
    //    //  // contract.
    //    // })
    //  })
    // });

    // console.log(newItem);

    // const items = this.state.items.concat(newItem);

    // this.setState({
    //  items
    // });

    // const { adress } = this.props.params;
    // api.updateContactItems(adress, items)
  }

  removeItem = (id) => {
    const { adress } = this.props.params;

    this.contract.deleteEntry(id);
    this.setState({
      loading: true
    })
    // const items = this.state.items.filter(x => x.id !== id);

    // this.setState({
    //  items
    // });
    // api.updateContactItems(adress, items)
  }
  
  render() {
    // const {  items, loading } = this.state;

    const { fields, items } = this.state;

    const head = fields.map(field => {
      return (
        <th key={field.name}>{field.name}</th>
      )
    })
    const rows = items.map(item => {
      const row = fields.map(field => {
        return (
          <td key={field.name}>{item[field.name]}</td>
        )
      })
      return (
        <tr key={item.id}>
          {row}
          <td key='remove'>
            <button onClick={() => this.removeItem(item.id)}>remove</button>
          </td>
        </tr>
      );
    });

    const bottom = fields.map(field => {
      return (
        <td key={field.name}>
          <input ref={field.name} />
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
            <tr>
              {bottom}
              <td>
                <button onClick={this.add}>add</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
    // const rows = items.map((item, index) => (
    //  <tr key={index}>
    //    <td>
    //      {item.name}
    //    </td>
    //    <td>
    //      {item.ticker}
    //    </td>
    //    <td>
    //      { !loading ? <button onClick={() => this.removeItem(index)}>remove</button>: <span>loading</span>}
    //    </td>
    //  </tr>
    // ))

    
    // return (
    //  <div>
    //    <table>
    //      <thead>
    //        <tr>
    //          <th>Name</th>
    //          <th>Tiker</th>
    //          <th></th>
    //        </tr>
    //      </thead>
    //      <tbody>
    //        {rows}
    //        {!loading ? <tr>
    //          <td>
    //            <input ref='name'/>
    //          </td>
    //          <td>
    //            <input ref='ticker'/>
    //          </td>
    //          <td>
    //            <button onClick={this.add}>add</button>
    //          </td>
    //        </tr> : null}
    //      </tbody>
    //    </table>
    //  </div>
    // );
  // }
}


export default Register;

