import * as React from 'react';

import { Link as RouterLink } from 'react-router';

const styles = require("./CallToAction.less");

export const Container = ({ children }) => (
  <div className={styles.container}>
    <div className={styles.innerContainer}>
    {children}
    </div>
  </div>
);

export const Text = ({ children }) => (
  <span className={styles.text}>
    {children}
  </span>
); 

export const Link = ({ children, ...props }) => (
  <RouterLink className={styles.link} {...props} >
    {children}
  </RouterLink>
); 
