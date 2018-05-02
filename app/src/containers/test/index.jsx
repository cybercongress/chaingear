// import React, { Component } from 'react';

// import Web3 from 'web3'

//     // var web3 = window.web3

//     // web3 = new Web3(web3.currentProvider)

//     const web3 = new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/eKZdJzgmRo31DJI94iSO'));
//     // web3.setProvider(new web3.providers.HttpProvider('https://kovan.infura.io/eKZdJzgmRo31DJI94iSO'));


//     const abi = [
//   {
//     "constant": false,
//     "inputs": [
//       {
//         "name": "_to",
//         "type": "address"
//       },
//       {
//         "name": "_value",
//         "type": "uint256"
//       }
//     ],
//     "name": "transfer",
//     "outputs": [],
//     "payable": false,
//     "stateMutability": "nonpayable",
//     "type": "function"
//   },
//   {
//     "inputs": [
//       {
//         "name": "initialSupply",
//         "type": "uint256"
//       }
//     ],
//     "payable": false,
//     "stateMutability": "nonpayable",
//     "type": "constructor"
//   },
//   {
//     "constant": true,
//     "inputs": [
//       {
//         "name": "",
//         "type": "address"
//       }
//     ],
//     "name": "balanceOf",
//     "outputs": [
//       {
//         "name": "",
//         "type": "uint256"
//       }
//     ],
//     "payable": false,
//     "stateMutability": "view",
//     "type": "function"
//   }
// ];

// const contractAddress = '0xE6Fd5CbA9549Dbb9099c2be63b77A51aFB963D87';
// const contract = new web3.eth.Contract(abi, contractAddress);
// // const privateKey = '726c3726b709d082e6549488259e2c3e6717b23853ea1d1eebb2b13b9b0d504b';
// const privateKey = '0x' +'726c3726b709d082e6549488259e2c3e6717b23853ea1d1eebb2b13b9b0d504b';

// export class Test extends Component {
//   state = {
//     accounts: [
//       {
//         address: '0xa3564D084fabf13e69eca6F2949D3328BF6468Ef',
//         balance: 0,
//         tokens: 0
//       },
//       {
//         address: '0xf2492533F7d89DBfEd69757156c4B746839E59E8',
//         balance: 0,
//         tokens: 0
//       }
//     ]
//   }
//   componentDidMount() {

//     const { accounts } = this.state;


//     const promises = accounts.map(account => 
//       new Promise((resolve, reject) => {
//         contract.methods.balanceOf(account.address).call()
//           .then(tokens => {
//             web3.eth.getBalance(account.address)
//               .then(balance => {
//                 resolve({
//                   tokens: tokens,
//                   address: account.address,
//                   balance: balance
//                 }) 
//               })
            
//           })
//       })
//     );
//     Promise.all(promises).then(accounts => this.setState({
//         accounts
//       }))
//     // const _accounts = accounts.map(item => ({
//     //   ...item,
//     //   balance: +contract.balanceOf(item.address)
//     // }))

    

//     // const acount1 = contract.balanceOf('0xa3564D084fabf13e69eca6F2949D3328BF6468Ef');
//     // const acount2 = contract.balanceOf('0xf2492533F7d89DBfEd69757156c4B746839E59E8');
//     // this.setState({
//     //   acount1: +acount1,
//     //   acount2: +acount2
//     // })
//     // contract.setProvider(web3.currentProvider);
//   }
//   test = () => {
//     // var web3 = window.web3

//     // web3 = new Web3(web3.currentProvider)

 
//     // const web3 = new Web3(web3.currentProvider);


//     // registryContract.setProvider(results.web3.currentProvider);

//     // console.log(web3.eth.accounts[0])

//     //web3.eth.accounts[0];

//     // console.log(web3.eth.accounts[0])
//     // web3.eth.defaultAccount = '0xa3564D084fabf13e69eca6F2949D3328BF6468Ef';    


//     // contract.methods.transfer('0xf2492533F7d89DBfEd69757156c4B746839E59E8', 1)
//     // .send({
//     //   callback: function(e, b){
//     //     console.log(e, b);
//     //   },
//     //   from: '0xa3564D084fabf13e69eca6F2949D3328BF6468Ef',
//     //   gasPrice: 1000,
//     //   gas: 10000
//     // });


//  var transfer = contract.methods.transfer('0xf2492533F7d89DBfEd69757156c4B746839E59E8', 2);
//   var encodedABI = transfer.encodeABI();

// //0xa3564D084fabf13e69eca6F2949D3328BF6468Ef
//   var tx = {
//     from: "0x68Ef8E56eEf696Bb9df05986aed847d67f7d679E",
//     to: contractAddress,
//     gas: 2000000,
//     // gasPrice: 8000000,
//     data: encodedABI
//   }; 

//   // 0xa3564D084fabf13e69eca6F2949D3328BF6468Ef

//   const account = web3.eth.accounts.privateKeyToAccount(privateKey);
// console.log('>>', account);
// web3.eth.getBalance(account.address).then(console.log);

//   web3.eth.accounts.signTransaction(tx, privateKey).then(signed => {
//     var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

//     tran.on('confirmation', (confirmationNumber, receipt) => {
//       console.log('confirmation: ' + confirmationNumber);
//     });

//     tran.on('transactionHash', hash => {
//       console.log('hash');
//       console.log(hash);
//     });

//     tran.on('receipt', receipt => {
//       console.log('reciept');
//       console.log(receipt);
//     });

//     tran.on('error', console.error);
//   });

//     //{ from: '0xa3564D084fabf13e69eca6F2949D3328BF6468Ef' });

//     // console.log(+b);

// //     console.log(web3.eth.accounts.privateKeyToAccount)
// // debugger
//     // const wallet = web3.eth.accounts.privateKeyToAccount('0x726c3726b709d082e6549488259e2c3e6717b23853ea1d1eebb2b13b9b0d504b');

//     // // console.log(wallet);
//     // // console.log(web3.utils.fromWei(web3.eth.getBalance(wallet.address, 'eth')));
//     // web3.eth.getBalance(wallet.address).then((balance) => console.log(web3.utils.fromWei(balance, 'ether')));


//     // // console.log(web3.utils.toWei(0.000559, 'ether'));
//     // debugger
//     // web3.eth.accounts.signTransaction({
//     //   to: '0xf2492533F7d89DBfEd69757156c4B746839E59E8',
//     //   value: web3.utils.toWei(0.000559, 'ether'),
//     //   gas: 21000
//     // }, wallet.privateKey, (err, msg) => {
//     //   debugger
//     //   console.log('!!!!!!!!', err, msg);
//     //   web3.eth.sendSignedTransaction(msg.rawTransaction, (err, msg2) => {
//     //     console.log('??????????', err, msg2);
//     //   })
//     // });

//   }
//   render() {
//     const { accounts } = this.state;

//     return (
//       <div>
//         <table>
//           <thead>
//             <tr>
//               <th>address</th>
//               <th>tokens</th>
//               <th>balance</th>
//             </tr>
//           </thead>
//           <tbody>
//             {accounts.map(item => (
//               <tr key={item.address}>
//                 <td>{item.address}</td>
//                 <td>{item.tokens}</td>                
//                 <td>{item.balance}</td>                
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <button onClick={this.test}>test</button>
//       </div>
//     );
//   }
// }

import React, { Component } from 'react';

import { getContract, getRegistry, saveInIPFS } from '../../utils/cyber';

import EntryCoreBuild from '../../../../build/contracts/EntryCore.json';

let _contract;
let _web3;
let _accounts;


import Web3 from 'web3'
const web3 = new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/eKZdJzgmRo31DJI94iSO'));

import Chaingear from '../../../../build/contracts/Chaingear.json';


import Registry from '../../../../build/contracts/Registry.json';
import EntryCore from '../../../../build/contracts/EntryCore.json';

import { getItems2, generateContractCode } from '../../utils/cyber';
// const _contract = new web3.eth.Contract(Chaingear.abi, Chaingear.networks['42'].address);

const createRegistry = (name, fields, symbol) => {

}

const getContractCode = (name, fields) => {

}

export class Test extends Component {
    state = {
        registries: [],
        code: '',
    }
    componentDidMount() {
        getContract()
            .then(({ contract, web3, accounts }) => {
                // debugger
                _contract = contract;
                _web3 = web3;
                _accounts = accounts;
            })
    }

    get = () => {
       getRegistry().then(data => {
            const address = data[0].address;

            const registry = _web3.eth.contract(Registry.abi).at(address);

            // registry.entryBase(function(e, data) {
            //     debugger
            // })

            registry.entryCreationFee(function(e, data) {
                var fee = data.toNumber();

                debugger
            })
       })
    }
    updateFee = () => {
       getRegistry().then(data => {
            const address = data[0].address;

            const registry = _web3.eth.contract(Registry.abi).at(address);
            registry.updateEntryCreationFee(_web3.toWei(0.001, 'ether'), function(){
                debugger
            })

        });
    }

    createEntry = () => {
        getRegistry().then(data => {
            const address = data[0].address;

            const registry = _web3.eth.contract(Registry.abi).at(address);

            registry.entryCreationFee(function(e, data) {
                var fee = data.toNumber();

                registry.createEntry({ value: fee }, function(){
                    debugger
                })
            })
            

        });
    }

    getAllEntrys = () => {
        getRegistry().then(data => {
            const address = data[0].address;

            const registry = _web3.eth.contract(Registry.abi).at(address);

            registry.entryBase(function(e, data) {
                

                const entryCore = _web3.eth.contract(EntryCore.abi).at(data);

                // entryCore.entriesAmount(function(e, data) {
                //     console.log(data.toNumber());
                // })

                const fields = [
                    { name: 'expensiveAddress'},
                    { name: 'expensiveUint' },
                    { name: 'expensiveInt' },
                    { name: 'expensiveString' }
                ]
                const mapFn = item => {
                  const aItem = Array.isArray(item) ? item : [item];
                  return fields.reduce((o, field, index) => {
                    o[field.name] = aItem[index]; 
                    return o;
                  },{})
                }
                
                getItems2(entryCore, 'entriesAmount', 'entryInfo', mapFn)
                    .then(items => {
                        console.log(items);
                  // this.setState({ 
                  //   items, fields ,
                  //   loading: false
                  // })
                    });
            })

            // registry.entryCreationFee(function(e, data) {
            //     var fee = data.toNumber();

            //     debugger
            // })
       })
    }

    updateEntrys = () => {
        getRegistry().then(data => {
            const address = data[0].address;

            const registry = _web3.eth.contract(Registry.abi).at(address);

            registry.entryBase(function(e, data) {
                

                const entryCore = _web3.eth.contract(EntryCore.abi).at(data);

                // entryCore.entriesAmount(function(e, data) {
                //     console.log(data.toNumber());


                // })
                // const fields = [
                //     { name: 'expensiveAddress'},
                //     { name: 'expensiveUint' },
                //     { name: 'expensiveInt' },
                //     { name: 'expensiveString' }
                // ]
                // const mapFn = item => {
                //   const aItem = Array.isArray(item) ? item : [item];
                //   return fields.reduce((o, field, index) => {
                //     o[field.name] = aItem[index]; 
                //     return o;
                //   },{})
                // }
                
                // getItems2(entryCore, 'entriesAmount', 'entryInfo', mapFn)
                //     .then(items => {
                //         console.log(items);
                //   // this.setState({ 
                //   //   items, fields ,
                //   //   loading: false
                //   // })
                //     });

                entryCore.updateEntry(0, "0x0000000000000000000000000000000000000001", 1, 2, 'test', function(e, data){
                    debugger
                })
            })

            // registry.entryCreationFee(function(e, data) {
            //     var fee = data.toNumber();

            //     debugger
            // })
       })
    }

    createRegistryClick = () => {
        // var buildingFee = 100000;
        // saveInIPFS(EntryCoreBuild.abi)
        //     .then(ipfsHash => {
        //         _contract.methods.registerRegistry(
        //              [], [], "BlockchainRegistry2", "BLCHR5", 
        //              ipfsHash,
        //              EntryCoreBuild.bytecode
        //         ).send({
        //             value: buildingFee, from: '0xa3564D084fabf13e69eca6F2949D3328BF6468Ef'
        //         }, function(e, r){
        //             debugger
        //         })
        //     })
        
        // console.log(_web3.eth.accounts[0]);

        // getRegistry().then(registries => 
        //     this.setState({
        //         registries
        //     })
        // )

        // _contract.registriesAmount()
        //     .then(d => {
        //         console.log(d.toNumber());
        //     })
        // _contract.registryInfo(0)
        //     .then(d => {
        //         debugger
        //     })

        // var buildingFee = 100000;
        var gas = 40000000
        saveInIPFS(EntryCoreBuild.abi)
            .then(ipfsHash => {
                // debugger
                // debugger
                // _contract.defaults({
                //   value: buildingFee
                // })
                _contract.registryRegistrationFee(function(e, data) {
                    
                    var buildingFee = data.toNumber();
                    debugger
                    _contract.registerRegistry.sendTransaction(
                        [], [], "BlockchainRegistry", "BLCHR", 
                        ipfsHash,
                        EntryCoreBuild.bytecode, 
                        { 
                            value: buildingFee,
                            //_web3.toWei(0.001, 'ether'), 
                            // gas: 10000000, 
                            // gasPrice: 15
                            // from: _accounts[0],
                            // Function: function(e, data) {
                            //     debugger
                            // }
                        },
                        function(e, data){
                            debugger
                        }
                    )
                })
                
            });
            // .then(d => {
            //     debugger
            // })
            
        // var buildingFee = 1000000;
        // _contract.registerRegistry(
        //             [], [], "BlockchainRegistry", "BLCHR", "",
        //             EntryCoreBuild.bytecode,
        //             { value: buildingFee, from: _accounts[0] }
        //         ).then(d => {
        //             debugger
        //         })

        // _contract.chaingearDescription()
        //     .then(d => {
        //         debugger
        //     })
        // _web3.eth.getAccounts(function(error, accounts) {
        //     _contract.updateDescription('111', { from: _accounts[0] })
        //         .then(d => {

        //         })

        // })
    }
    getContractCodeClick = () => {
        const code = generateContractCode('Tokens', [{ name: 'name', type: 'string'}, { name: 'symbol', type: 'string' }]);
        this.setState({
            code
        })
    }
    render() {
        const { registries, code } = this.state;

        const items = registries.map(x => (
            <div key={x.name}>
                {x.name}
            </div>
        ));

        return (
            <div>
                <div>
                    {items}
                </div>
                <div>
                    <div>
                        <textarea rows="25" cols="60" value={code} onChange={()=>{}}>
                        </textarea>
                        <button onClick={this.getContractCodeClick}>getContractCode</button>
                    </div>
                    <button onClick={this.createRegistryClick}>create registry</button>
                    <button onClick={this.get}>get</button>
                    <button onClick={this.updateFee}>update fee</button>
                    <button onClick={this.createEntry}>create entry</button>
                    <button onClick={this.getAllEntrys}>get all entrys</button>
                    <div>
                    <button onClick={this.updateEntrys}>updateEntrys</button>
                    </div>
                </div>
            </div>
        );
    }
}

