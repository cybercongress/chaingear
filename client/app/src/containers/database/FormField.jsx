import React, { Component } from 'react';

import {
    FormFieldContainer,
    FormLabel,
    FormValue,
    ButtonContainer,
} from '../../components/FormField';


import {
    EditButton,
    UpdateButton,
    CancelButton,
} from '../../components/DatabaseItem';

class FormField extends Component {
    state = {
        edit: false,
    }

    startEdit = () => {
        this.setState({ edit: true });
    }

    save = () => {
        const { onUpdate, children } = this.props;

        this.setState({ edit: false });

        if (children) {
            onUpdate();
        } else {
            onUpdate(this.refs.input.value);
        }
    }

    cancel = () => {
        this.setState({ edit: false });
    }

    render() {
        const {
            label, value, valueType, onUpdate, children,
        } = this.props;
        const { edit } = this.state;

        return (
            <FormFieldContainer>
                <FormLabel>
                    {`${label}:`}
                </FormLabel>
                <FormValue>
                    {!edit ? (
                        <span>
                            <span>{value}</span>
                            <span style={ { marginLeft: 5 } }>{valueType}</span>
                        </span>
                    ) : (
                        <span>
                        {children ? (
                            <span>
                                {children}
                            </span>
                        ) : (
                            <input ref='input' defaultValue={ value } />
                        )}
                        </span>
                    )}
                </FormValue>
                {onUpdate && (
                    <ButtonContainer>
                        {!edit ? (
                            <div>
                                <EditButton onClick={ this.startEdit }>Update</EditButton>
                            </div>
                        ) : (
                            <div>
                                <UpdateButton onClick={ this.save }>save</UpdateButton>
                                <CancelButton onClick={ this.cancel }>cancel</CancelButton>
                            </div>
                        )}
                    </ButtonContainer>
                )}
            </FormFieldContainer>
        );
    }
}

export default FormField;
