import React, { Component } from 'react';

import ValueInput from '../../components/ValueInput';

import { 
    Section,
    SectionContent,
    Centred 
} from '../../components/chaingear/'

import QRCode from '../../components/QRCode/';

import {
    Label,
    Amount,
    ButtonContainer,
    FieldLabel,
    FieldValue,
    FieldInput,

    EditButton,
    DeleteButton,
    UpdateButton,
    CancelButton
} from '../../components/RegistryItem/';

class RegistryItem extends Component {
    state = {
        edit: false,
        data: {}
    }

    constructor(props) {
        super(props);
        this._refs = {};
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

        for(let key in this._refs) {
          if (this._refs[key]) {
            const field = fields.find(x => x.name === key);
            if (field.type === 'bool') {
              args.push(this._refs[key].checked);
            } else {
              args.push(this.state.data[key]);
            }
            newItem[key] = +this._refs[key].value          
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
            fundEntryClick,
            userAccount
        } = this.props;

        const {
            edit
        } = this.state;

        let row = fields.map(field => {
            return (
                <div key={field.name}>
                    <FieldLabel>{field.name}</FieldLabel>
                    <FieldValue>{item[field.name].toString()}</FieldValue>
                </div>
            );
        });

        let button = (
            <div>
                <EditButton onClick={this.startEdit}>edit</EditButton>
                <DeleteButton onClick={() => removeItemClick(index)}>remove</DeleteButton>
            </div>
        );

        if (edit) {
            row = fields.map(field => {
              let control = (
                <FieldInput 
                  inputRef={el => this._refs[field.name] = el}
                  onChange={e => this.change(e, field.name, field.type)}
                  defaultValue={item[field.name].toString()}
                />
              );
              if (field.type === 'bool') {
                control = <input ref={field.name}  type='checkbox' />
              }
              return (
                <div key={field.name}>
                  <FieldLabel>{field.name}</FieldLabel>
                  {control}
                </div>
              )
            });

            button = (
                <div>
                    <UpdateButton onClick={this.update}>update</UpdateButton>
                    <CancelButton onClick={this.cancel}>cancel</CancelButton>
                </div>
            );
        }

        const isOwner = userAccount === item.owner;

        return (
            <div>
                {isOwner && <ButtonContainer>
                    {button}                    
                </ButtonContainer>}
                <Section>
                    <SectionContent grow={2}>
                        <div style={{ margintTop: 20 }}>
                        {row}
                        </div>
                    </SectionContent>

                    <SectionContent grow={0} style={{ width: '25%'}}>   
                        <Centred>                     
                            <div>
                               <QRCode hash='0xb6ee5dcb7b5e63704a9af45bdd9e0e493ff26c81' size={100} />
                            </div>
                            <div>
                                <ValueInput 
                                  onInter={(value) => fundEntryClick(index, value)}
                                  buttonLable='fund entry'
                                />
                            </div>
                        </Centred>
                    </SectionContent>

                    <SectionContent grow={0} style={{ width: '25%'}}>
                        <Centred style={{ justifyContent: 'space-between'}}>
                        <Label>
                            Funded:
                        </Label>
                        <Amount>
                            {item['currentEntryBalanceETH']} ETH
                        </Amount>
                        {isOwner && <ValueInput 
                            onInter={(value) => clameRecord(index, value)}
                            buttonLable='claim funds'
                            color='second'
                        />}
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

