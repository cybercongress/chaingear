import React, { Component } from 'react';
import Robohash from '../../components/Robohash';
import ValueInput from '../../components/ValueInput';

class TransferForm extends Component {
    render() {
        const {
            address, isOwner, onTransfer, height,
        } = this.props;

        let content = (
            <Robohash hash={ address } style={ { width: 'auto', height: '100%' } } />
        );

        if (isOwner) {
            content = (
                <ValueInput
                  onInter={ onTransfer }
                  buttonLable='transfer'
                  color='second'
                />
            );
        }

        return (
            <div
              style={ {
                height, marginBottom: 20, display: 'flex', alignItems: 'center',
              } }
            >
                {content}
            </div>
        );
    }
}

export default TransferForm;
