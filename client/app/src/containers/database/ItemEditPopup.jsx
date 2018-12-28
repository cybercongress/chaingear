import * as React from 'react';
import {
    ContentInput, ContentLineTextInput, LineControl, LineTitle,
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
    };

    onChange = (event, fieldName, fieldType) => {
        if (fieldType === 'int256' && isNaN(event.target.value)) { return; }

        if (fieldType === 'uint256' && (isNaN(event.target.value) || +event.target.value < 0)) { return; }

        let value = event.target.value;

        if (fieldType === 'bool') {
            value = event.target.checked;
        }

        this.setState({
            item: {
                ...this.state.item,
                [fieldName]: value,
            },
        });
    };

    onCancelClick = () => {
        debugger;
        this.setState({
            item: this.props.item,
        });

        this.props.onCancelClick();
    };

    onConfirmClick = () => {
        const { item, fields } = this.state;
        const values = fields.map(field => item[field.name]);

        this.props.onConfirmClick(values, item.id);
    };

    render() {
        const { item, fields } = this.state;
        const { open } = this.props;

        const rows = fields.map((field, index) => (
            <ContentLineTextInput key={index}>
                <LineTitle>{field.name} {field.unique && '(unique)'}</LineTitle>
                <LineControl>
                    {field.type === 'bool' ?
                        (
                            <input
                              type='checkbox'
                              ref={node => this.inputRefs[field.name] = node}
                              onChange={event => this.onChange(event, field.name, field.type)}
                              checked={item[field.name]}
                            />
                        ) : (
                            <ContentInput
                              inputRef={node => this.inputRefs[field.name] = node}
                              onChange={event => this.onChange(event, field.name, field.type)}
                              defaultValue={item[field.name].toString()}
                              placeholder={field.type}
                            />
                        )
                    }
                </LineControl>
            </ContentLineTextInput>
        ));

        return (
            <Popup open={open}>
                <PopupTitle>Edit record</PopupTitle>
                <PopupContent>
                    {rows}
                </PopupContent>
                <PopupFooter>
                    <PopupButton type='cancel' onClick={this.onCancelClick}>Cancel</PopupButton>
                    <PopupButton type='confirm' onClick={this.onConfirmClick}>Confirm</PopupButton>
                </PopupFooter>
            </Popup>
        );
    }

}
