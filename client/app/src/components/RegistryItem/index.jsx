import * as React from 'react';

const styles = require("./RegistryItem.less");

export const Label = (props) => (
    <div {...props} className={styles.label}/>
);

export const Amount = (props) => (
    <div {...props} className={styles.amount}/>
);

export const ButtonContainer = (props) => (
    <div {...props} className={styles.buttonContainer} />
);


export const FieldLabel = (props) => (
    <span {...props} className={styles.fieldLabel} />
);

export const FieldValue = (props) => (
    <span {...props} className={styles.fieldValue} />
);


export const FieldInput = ({ inputRef, ...props }) => (
    <input {...props} ref={inputRef} className={styles.fieldInput} />
);


export const EditButton = (props) => (
    <button {...props} className={styles.editButton} />
);

export const DeleteButton = (props) => (
    <button {...props} className={styles.deleteButton} />
);

export const UpdateButton = (props) => (
    <button {...props} className={styles.updateButton} />
);

export const CancelButton = (props) => (
    <button {...props} className={styles.cancelButton} />
);

export const IdContainer = (props) => (
    <div {...props} className={styles.idcontainer}/>
);
