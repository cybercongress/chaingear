import * as React from 'react';

const styles = require("./newregistry.less");

export const FieldsTable = ({ children }) => (
  <table className={styles.fieldsTable}>
    {children}
  </table>
);

export const Panel = ({ children, title }) => (
  <div className={styles.panel}>
    {title && <h3 className={styles.panelTitle}>{title}</h3>}
    <div className={styles.panelContent}>
      {children}
    </div>
  </div>
);

export const Label = ({ children, color }) => (
  <label className={styles.label} style={{ background: color }}>
    {children}
  </label>
);


export const CreateButton = ({ children, ...ptops }) => (
  <button  className={styles.createButton} {...ptops}>
    {children}
  </button>
);


export const SideBar = ({ children }) => (
  <div className={styles.sideBar}>
    {children}
  </div>
);

export const Content = ({ children }) => (
  <div className={styles.content}>
    {children}
  </div>
);

export const ContainerRegister = ({ children }) => (
  <div className={styles.container2}>
    {children}
  </div>
);


export const Control = ({ children, title }) => (
  <div className={styles.control}>
    <label className={styles.controlLabel}>{title}</label>
    <div className={styles.controlComponent}>{children}</div>
  </div>
);


export const PageTitle = ({ children, inline }) => (
  <h2 className={styles.pageTitle}>
    {children}
  </h2>
);
