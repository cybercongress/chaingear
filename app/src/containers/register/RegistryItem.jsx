import React, { Component } from 'react';

import ValueInput from '../../components/ValueInput';

import { 

    Section,
    SectionContent,
    Centred 
} from '../../components/chaingear/'

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
                <div key={field.name}>
                    <span>{field.name}</span>
                    <span>{item[field.name].toString()}</span>
                </div>
            );
        });

        let button = (
            <div>
                <button onClick={this.startEdit}>update</button>
                <button onClick={() => removeItemClick(index)}>remove</button>
            </div>
        );

        if (edit) {
            row = fields.map(field => {
              let content = (
                <input 
                  ref={field.name} 
                  onChange={e => this.change(e, field.name, field.type)}
                  defaultValue={item[field.name].toString()}
                />
              );
              if (field.type === 'bool') {
                content = <input ref={field.name}  type='checkbox' />
              }
              return (
                <div key={field.name}>
                  <span>{field.name}</span>
                  {content}
                </div>
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
            <div>
                <div>
                    {button}                    
                </div>
                <Section>
                    <SectionContent grow={2}>
                        {row}
                    </SectionContent>

                    <SectionContent>   
                        <Centred>                     
                            <div>
                                qr
                            </div>
                            <div>
                                <ValueInput 
                                  onInter={(value) => fundEntryClick(index, value)}
                                  buttonLable='fund entry'
                                />
                            </div>
                        </Centred>
                    </SectionContent>

                    <SectionContent>
                        <Centred>
                        <div>
                            Funded:
                        </div>
                        <div>{item['currentEntryBalanceETH']} ETH</div>
                        <ValueInput 
                            onInter={(value) => clameRecord(index, value)}
                            buttonLable='claim funds'
                            color='second'
                        />
                        </Centred>
                    </SectionContent>


                </Section>
            </div>
        );
    }
}

const RegistryList = ({ children }) => (
    <div>
        {children}
    </div>
);

export { RegistryItem, RegistryList };

