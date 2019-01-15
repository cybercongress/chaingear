import * as React from 'react';
import {
    ContentLineTextInput, LineControl, LineTitle, WideInput,
    Popup, PopupTitle, PopupContent, PopupFooter, PopupButton,
} from '@cybercongress/ui';
import { Subscribe } from 'unstated';
import { debounce } from '../../utils/utils';
import page from './page';

const web3Utils = require('web3-utils');

export default class ItemEditPopup extends React.Component {
    constructor(props) {
        super(props);

        this.inputRefs = {};

        this.state = {
            item: page.state.recordForAction,
            errors: {},
        };

        this.updateField = debounce(this.updateField, 1000);
    }

    isValidValue = (value, type) => {
        switch (type) {
        case 'int256':
            return /^[-+]?\d+$/.test(value);
        case 'uint256':
            return /^\d+$/.test(value);
        case 'address':
            return web3Utils.isAddress(value);
        case 'string':
            return value.length <= 30;
        default:
            return true;
        }
    };

    isUniqueFiled = (field, value, records) => {
        const {
            item,
        } = this.state;

        let duplicateFound = false;

        for (let index = 0; index < records.length; index += 1) {
            if (records[index].id !== item.id && records[index][field.name] === value) {
                duplicateFound = true;
                break;
            }
        }

        return !duplicateFound;
    };

    updateField = (event, field, fieldIndex, dbPage) => {
        const { item, errors } = this.state;
        const { items: records, fields } = dbPage.state;
        let { value } = event.target;
        let errorMessage = null;

        if (field.type === 'bool') {
            value = event.target.checked;
        }

        if (!this.isValidValue(value, field.type)) {
            errorMessage = `Check the type, ${field.type} was expected`;
        }

        if (field.unique && !errorMessage && !this.isUniqueFiled(field, value, records)) {
            errorMessage = 'This field must be unique';
        }

        const filteredErrors = fields
            .map(fieldM => fieldM.name)
            .reduce((obj, key) => {
                if (errors[key] && key !== field.name) {
                    obj[key] = errors[key];
                }

                if (key === field.name && errorMessage) {
                    obj[key] = errorMessage;
                }

                return obj;
            }, {});

        this.setState({
            item: {
                ...item,
                [field.name]: value,
            },
            errors: filteredErrors,
        });
    };

    onValueChange = (event, field, fieldIndex, dbPage) => {
        event.persist();

        this.updateField(event, field, fieldIndex, dbPage);
    };

    onCancelClick = () => {
        const { item, onCancelClick } = this.props;

        this.setState({
            item,
        });

        onCancelClick();
    };

    onConfirmClick = (dbPage) => {
        const { item } = this.state;
        const { fields } = dbPage.state;
        const values = fields.map(field => item[field.name]);

        dbPage.closePopups();
        dbPage.updateRecord(values, item.id);
    };

    render() {
        return (
            <Subscribe to={ [page] }>
                {(dbPage) => {
                    const { errors } = this.state;
                    const { recordForAction, fields } = dbPage.state;
                    const { open } = this.props;

                    const rows = fields.map((field, index) => (
                        <ContentLineTextInput key={ `${field.name}${field.type}` }>
                            <LineTitle>
                                {field.name}
                            </LineTitle>
                            <LineControl>
                                {field.type === 'bool'
                                    ? (
                                        <input
                                          type='checkbox'
                                          ref={ (node) => { this.inputRefs[field.name] = node; } }
                                          onChange={ event => this.onValueChange(
                                              event, field, index, dbPage,
                                          ) }
                                          checked={ recordForAction[field.name] }
                                        />
                                    ) : (
                                        <WideInput
                                          inputRef={ (node) => {
                                              this.inputRefs[field.name] = node;
                                          } }
                                          onChange={ event => this.onValueChange(
                                              event, field, index, dbPage,
                                          ) }
                                          defaultValue={ recordForAction[field.name].toString() }
                                          placeholder={ `${field.type}${field.unique ? ' (unique)' : ''}` }
                                          valid={ !errors[field.name] }
                                          errorMessage={ errors[field.name] }
                                          maxLength={ 42 }
                                        />
                                    )
                                }
                            </LineControl>
                        </ContentLineTextInput>
                    ));

                    return (
                        <Popup open={ open }>
                            <PopupTitle>Edit record</PopupTitle>
                            <PopupContent>
                                {rows}
                            </PopupContent>
                            <PopupFooter>
                                <PopupButton type='cancel' onClick={ dbPage.closePopups }>Cancel</PopupButton>
                                <PopupButton
                                  disabled={ Object.keys(errors).length > 0 }
                                  type='confirm'
                                  onClick={ () => this.onConfirmClick(dbPage) }
                                >
                                    Confirm
                                </PopupButton>
                            </PopupFooter>
                        </Popup>
                    );
                }}
            </Subscribe>
        );
    }
}
