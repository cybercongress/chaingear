import * as React from 'react';

const styles = require("./Chaingear.less");

import { Link } from 'react-router';

export const Container = ({ children }) => (
  <div className={styles.container}>
    <div className={styles.containerInner}>
    {children}
    </div>
  </div>
);


export const Paper = ({ children }) => (
  <div className={styles.paper}>
    {children}
  </div>
);



export const Title = ({ children }) => (
  <h2 className={styles.titile}>
    {children}
  </h2>
);


export const Badge = ({ children }) => (
  <span className={styles.badge} >
    {children}
  </span>
);

export const FooterButton = (props) => (
    <Link {...props} className={styles.footerButton}/>
);

export const PageTitle = ({ children, inline }) => (
  <h2 className={styles.pageTitle}>
    {children}
  </h2>
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

export const Label = ({ children, color }) => (
  <label className={styles.label} style={{ background: color }}>
    {children}
  </label>
);

export const Panel = ({ children, title }) => (
  <div className={styles.panel}>
    {title && <h3 className={styles.panelTitle}>{title}</h3>}
    <div className={styles.panelContent}>
      {children}
    </div>
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


export const TotalCost = ({ value }) => (
  <div className={styles.totalCost}>
    <span>Total cost:</span>
    <span>{value} gwei</span>
  </div>
);


export const CreateButton = ({ children, ...ptops }) => (
  <button  className={styles.createButton} {...ptops}>
    {children}
  </button>
);

export const FieldsTable = ({ children }) => (
  <table className={styles.fieldsTable}>
    {children}
  </table>
);


export const AddItemButton = (props) => (
    <button {...props} className={styles.addItemButton}/>
);

export const AddItemButtonText = (props) => (
    <span {...props} className={styles.addItemButtonText} />
);




export const SectionTabs = ({ children }) => (
  <div className={styles.sectionTabContainer}>
    {children}
  </div>
);

export const SectionTitle = ({ children }) => (
  <h3 className={styles.sectionTitle}>
    {children}
  </h3>
)

export const Section = ({ children, title }) => (
  <div>
    {title && <SectionTitle>{title}</SectionTitle>}
    <div className={styles.section}>    
      {children}
    </div>
  </div>
)


export const SectionContent = ({ children, title, grow = 1, style }) => (
  <div className={styles.sectionContent} style={{ flexGrow: grow, ...style }}>
    {title && <SectionTitle>{title}</SectionTitle>}
    <Paper>
    {children}
    </Paper>
  </div>
)


export const Centred = (props) => (
    <div {...props} className={styles.centred}/>
)

export const Button = (props) => (
    <button {...props} className={styles.button + ' ' + (props.color ? styles[props.color]: '')} />
);

