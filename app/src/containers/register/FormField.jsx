import React, { Component } from 'react';

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
            <div>
                <span>{label}:</span>
                {!edit ? (<span>{value}</span>) : (<input ref='input' defaultValue={value}/>)}
                {onUpdate && (
                    <div>
                        {!edit ? (
                            <div>
                                <button onClick={this.startEdit}>Update</button>
                            </div>
                        ) : (
                            <div>
                                <button onClick={this.save}>save</button>
                                <button onClick={this.cancel}>cancel</button>
                            </div>
                        )}
                    </div>
                    
                )}
            </div>
        );
    }
}


export default FormField;

