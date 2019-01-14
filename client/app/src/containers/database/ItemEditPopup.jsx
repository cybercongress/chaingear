import * as React from 'react';
import {
    ContentLineTextInput, LineControl, LineTitle, WideInput,
    Popup, PopupTitle, PopupContent, PopupFooter, PopupButton,
} from '@cybercongress/ui';
import { debounce } from '../../utils/utils';

export default class ItemEditPopup extends React.Component {
    constructor(props) {
        super(props);

        this.inputRefs = {};

        this.state = {
            item: props.item,
            records: props.records,
            fields: props.fields,
        };

        this.updateField = debounce(this.updateField, 1000);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        const { item } = this.props;

        if (nextProps.item !== item) {
            this.setState({
                item: nextProps.item,
                records: nextProps.records,
                fields: nextProps.fields,
            });
        }
    }

    isValidValue = (value, type) => {
        switch (type) {
        case 'int256':
            break;
        case 'uint256':
            break;
        case 'address':
            break;
        case 'string':
            break;
        default:
            return true;
        }

        return true;
    };

    isUniqueFiled = (field, value) => {
        const {
            item,
            records,
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

    updateField = (event, field, fieldIndex) => {
        const { item, fields } = this.state;
        let { value } = event.target;
        let errorMessage = null;

        if (field.type === 'bool') {
            value = event.target.checked;
        }

        if (!this.isValidValue(value, field.type)) {
            errorMessage = `Check the type, ${field.type} was expected`;
        }

        if (field.unique && !errorMessage && !this.isUniqueFiled(field, value)) {
            errorMessage = 'This field must be unique';
        }

        fields[fieldIndex] = {
            ...field,
            errorMessage,
        };

        this.setState({
            item: {
                ...item,
                [field.name]: value,
            },
            fields,
        });
    };

    onValueChange = (event, field, fieldIndex) => {
        event.persist();

        this.updateField(event, field, fieldIndex);
    };

    onCancelClick = () => {
        const { item, onCancelClick } = this.props;

        this.setState({
            item,
        });

        onCancelClick();
    };

    onConfirmClick = () => {
        const { item, fields } = this.state;
        const { onCancelClick, onConfirmClick } = this.props;
        const values = fields.map(field => item[field.name]);

        onCancelClick();
        onConfirmClick(values, item.id);
    };

    render() {
        const { item, fields } = this.state;
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
                              onChange={ event => this.onValueChange(event, field, index) }
                              checked={ item[field.name] }
                            />
                        ) : (
                            <WideInput
                              inputRef={ (node) => { this.inputRefs[field.name] = node; } }
                              onChange={ event => this.onValueChange(event, field, index) }
                              defaultValue={ item[field.name].toString() }
                              placeholder={ `${field.type}${field.unique ? ' (unique)' : ''}` }
                              valid={ !field.errorMessage }
                              errorMessage={ field.errorMessage }
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
                    <PopupButton type='cancel' onClick={ this.onCancelClick }>Cancel</PopupButton>
                    <PopupButton type='confirm' onClick={ this.onConfirmClick }>Confirm</PopupButton>
                </PopupFooter>
            </Popup>
        );
    }
}
