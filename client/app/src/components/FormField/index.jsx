import * as React from 'react';

const styles = require('./FormField.less');


export const FormFieldContainer = ({ children }) => (
    <div className={ styles.formField }>
        {children}
    </div>
);

export const FormLabel = props => (
    <span { ...props } className={ styles.foramLable } />
);


export const FormValue = props => (
    <span { ...props } className={ styles.foramValue } />
);

export const ButtonContainer = props => (
    <div { ...props } className={ styles.buttonContainer } />
);
