import React, { Component } from 'react';

import ValueInput from '../../components/ValueInput';

import {
    Section,
    SectionContent,
    Centred,
} from '@cybercongress/ui';

import TransferForm from './TransferForm';

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
    CancelButton,
    IdContainer,
} from '../../components/DatabaseItem';

class DatabaseItem extends Component {
    state = {
        edit: false,
        data: {}
    }

    constructor(props) {
        super(props);
        this._refs = {};
        const data = {};

        props.fields.forEach(field => {
            data[field.name] = props.item[field.name].toString()
        })

        this.state.data = data;
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
            userAccount,
            onTransfer
        } = this.props;

        const {
            edit
        } = this.state;

        let row = fields.map(field => {
            return (
                <div key={field.name}>
                    <FieldLabel>{field.name.toUpperCase()}</FieldLabel>
                    <FieldValue>{item[field.name].toString()}</FieldValue>
                </div>
            );
        });

        let button = (
            <div>
                <EditButton onClick={this.startEdit}>edit</EditButton>
                <DeleteButton
                  disabled={item['currentEntryBalanceETH'] > 0}
                  onClick={() => removeItemClick(index)}
                >remove</DeleteButton>
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
                  <FieldLabel>{field.name.toUpperCase()}</FieldLabel>
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
                            <IdContainer>TOKEN_ID : {item.id}</IdContainer>
                        {row}
                        </div>
                    </SectionContent>
                    <SectionContent grow={0} style={{ width: '25%'}}>
                        <Centred>
                            <div>
                               {/* <QRCode hash='0xb6ee5dcb7b5e63704a9af45bdd9e0e493ff26c81' size={100} />*/}
                               <TransferForm
                                  height={100}
                                  address={item.owner}
                                  isOwner={isOwner}
                                  onTransfer={onTransfer}
                                />
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
                        <Centred style={{ justifyContent: isOwner ? 'space-between' : 'start' }}>
                        <Label style={{ marginBottom : isOwner ? 0 : 40 }}>
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

const DatabaseList = ({ children }) => (
    <div>
        {children}
    </div>
);

export { DatabaseItem, DatabaseList };
