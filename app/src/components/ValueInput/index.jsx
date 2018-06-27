import React, { Component } from 'react';

import ClickOutside from 'react-click-outside';
const styles = require("./valueInput.less");


import { 
    Button
} from '../chaingear/'

class ValueInput extends Component {
    state = {
        open: false,
    }
    fundEntryClick = () => {
        this.setState({
            open: true
        })
    }

    handleClickOutside = () => {
        if (this.state.open) {
            this.cancel()
        }
    }

    ok = () => {
        const value = this.refs.value.value;
        this.props.onInter(value);
        this.setState({
            open: false
        })

    }

    componentDidUpdate = (prevProps, prevState, snapshot) => {
        if (prevState.open === false) {
            this.refs.value.focus();
        }
    }
    
    cancel = () => {
        this.setState({
            open: false
        })

    }
    render() {
        const { width, color } = this.props;

        let buttonLable = this.props.buttonLable || 'fundEntry';

        const { open } = this.state;
        let content =  (
            <div className={styles.container} style={{ width: width }}>
                <Button color={color} style={{ width: '100%' }} onClick={this.fundEntryClick}>{buttonLable}</Button>
            </div>
        );

        if (open) {
            content = (
                <div className={styles.container} style={{ width: width }}>
                    <input ref='value' className={styles.input}/>
                    <button className={styles.nextBtn + ' ' + (color ? styles[color]: '')} onClick={this.ok}>ok</button>
                </div>
            )
        }
        
        return (
            <ClickOutside onClickOutside={this.handleClickOutside}>
                {content}
            </ClickOutside>
        );
    }
}


export default ValueInput;
