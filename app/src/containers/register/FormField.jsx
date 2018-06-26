import React, { Component } from 'react';

import {
    FormFieldContainer,
    ForamLable,
    ForamValue,
    ButtonContainer
} from '../../components/FormField/';


import {
    EditButton,
    UpdateButton,
    CancelButton
} from '../../components/RegistryItem/';

class FormField extends Component {
    state = {
        edit: false
    }

    startEdit = () => {
        // this.props.onStart();
        this.setState({ edit: true })
    }

    save = () => {
        const { onUpdate } = this.props;
        this.setState({ edit: false })
        onUpdate(this.refs.input.value)
    }

    cancel = () => {
        this.setState({ edit: false })        
    }

    render() {
        console.log(' render ')
        const { label, value, onUpdate } = this.props;
        const { edit } = this.state;

        return (
            <FormFieldContainer>
                <ForamLable>{label}:</ForamLable>
                <ForamValue>{!edit ? (<span>{value}</span>) : (<input ref='input' defaultValue={value}/>)}</ForamValue>
                {onUpdate && (
                    <ButtonContainer>
                        {!edit ? (
                            <div>
                                <EditButton onClick={this.startEdit}>Update</EditButton>
                            </div>
                        ) : (
                            <div>
                                <UpdateButton onClick={this.save}>save</UpdateButton>
                                <CancelButton onClick={this.cancel}>cancel</CancelButton>
                            </div>
                        )}
                    </ButtonContainer>
                    
                )}
            </FormFieldContainer>
        );
    }
}


export default FormField;

