import * as React from 'react';
import {
    ContentLineTextInput, LineControl, LineTitle, WideInput,
    Popup, PopupTitle, PopupContent, PopupFooter, PopupButton,
} from '@cybercongress/ui';

export default class ItemEditPopup extends React.Component {
    constructor(props) {
        super(props);

        this.inputRefs = {};

        this.state = {
            item: props.item,
            fields: props.fields,
        };
    }

    componentWillReceiveProps(nextProps, nextContext) {
        const { item } = this.props;

        if (nextProps.item !== item) {
            this.setState({
                item: nextProps.item,
                fields: nextProps.fields,
            });
        }
    }

    onChange = (event, fieldName, fieldType) => {
        if (fieldType === 'int256' && isNaN(event.target.value)) { return; }

        if (fieldType === 'uint256' && (isNaN(event.target.value) || +event.target.value < 0)) { return; }

        let { value } = event.target;

        if (fieldType === 'bool') {
            value = event.target.checked;
        }

        const { item } = this.state;

        this.setState({
            item: {
                ...item,
                [fieldName]: value,
            },
        });
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

        const rows = fields.map(field => (
            <ContentLineTextInput key={ `${field.name}${field.type}` }>
                <LineTitle>
                    {`${field.name} ${field.unique && '(unique)'}`}
                </LineTitle>
                <LineControl>
                    {field.type === 'bool'
                        ? (
                            <input
                              type='checkbox'
                              ref={ (node) => { this.inputRefs[field.name] = node; } }
                              onChange={ event => this.onChange(event, field.name, field.type) }
                              checked={ item[field.name] }
                            />
                        ) : (
                            <WideInput
                              inputRef={ (node) => { this.inputRefs[field.name] = node; } }
                              onChange={ event => this.onChange(event, field.name, field.type) }
                              defaultValue={ item[field.name].toString() }
                              placeholder={ field.type }
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
