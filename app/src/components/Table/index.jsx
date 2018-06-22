import * as React from 'react';

const styles = require("./Table.less");


export const Table = ({ children }) => (
  <table className={styles.table}>
    {children}
  </table>
);
