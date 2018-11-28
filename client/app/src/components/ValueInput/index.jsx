import React, { Component } from 'react';

import ClickOutside from 'react-click-outside';


import {
    Button,
} from '@cybercongress/ui';

const styles = require('./valueInput.less');

class ValueInput extends Component {
    state = {
        open: false,
    }

    fundEntryClick = () => {
        this.setState({
            open: true,
        });
    }

    handleClickOutside = () => {
        if (this.state.open) {
            this.cancel();
        }
    }

    ok = () => {
        const value = this.refs.value.value;

        this.props.onInter(value);
        this.setState({
            open: false,
        });
    }

    componentDidUpdate = (prevProps, prevState, snapshot) => {
        if (prevState.open === false && this.refs.value) {
            this.refs.value.focus();
        }
    }

    cancel = () => {
        this.setState({
            open: false,
        });
    }

    render() {
        const { width, color } = this.props;

        const buttonLable = this.props.buttonLable || 'fundEntry';

        const { open } = this.state;
        let content = (
            <div className={ styles.container } style={ { width } }>
                <Button color={ color } style={ { width: '100%' } } onClick={ this.fundEntryClick }>{buttonLable}</Button>
            </div>
        );

        if (open) {
            content = (
                <div className={ styles.container } style={ { width } }>
                    <input ref='value' className={ styles.input } />
                    <button className={ `${styles.nextBtn} ${color ? styles[color] : ''}` } onClick={ this.ok }>ok</button>
                </div>
            );
        }

        return (
            <ClickOutside onClickOutside={ this.handleClickOutside }>
                {content}
            </ClickOutside>
        );
    }
}


export default ValueInput;
