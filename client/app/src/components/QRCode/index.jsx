import * as React from "react";

var QRCode = require('qrcode.react');

const styles = require("./QRCode.less");

const QRCodeWrapper = ({ hash, size = 140 }) => (
  <QRCode size={size} value={hash} className={styles.container}/>
);

export default QRCodeWrapper;
