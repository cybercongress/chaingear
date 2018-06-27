import * as React from 'react';

const styles = require("./StatusBar.less");

// TODO: move in browser
const StatusBar = ({ open, message }) => (
    <div style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          display: open ? 'flex' : 'none',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '50px',
          color: '#fff'
        }}
      className={styles.container}
    >
        <div className={styles.message}>{message}</div>
    </div>
);

export default StatusBar;
