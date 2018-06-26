
import * as React from "react";
import { Link } from 'react-router';

const styles = require("./LinkHash.less");

import cx from 'classnames';

export const Hash = ({ value }) => {
  //TODO: fix when change backend
  const _value = value.substr(2, value.length );

  let inx = 2;
  const items = [];
  while(inx <= _value.length - 4) {
    items.push(_value.substr(inx, 6));
    inx += 6;
  }

  return (
    <span className={styles.hash}>
      {_value.substr(0, 2)}
      {items.map((code, i) => (
        <span
          key={i}
          className={styles.hashPart}
          style={{ background: '#' + code, color: '#' + code }}
        >{code}</span>)
      )}
      {_value.substr(_value.length - 2)}
    </span>
  );
}

//https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
}

export const LinkHash = ({ value, to, marginLeft, noCopy }) => {
  const copyFunc = (e) => {
    copyTextToClipboard(value);
    e.preventDefault();
    e.target.blur();
  }
  if (to) {
    return (
      <Link to={to} className={
        cx(styles.linHash, { 
          [styles.linHashMarginLeft] : marginLeft,
          [styles.noCopy] : noCopy
        })}>
        <Hash value={value} />
        <button 
          className={styles.copyButton} 
          title='click to copy'
          onClick={copyFunc}
        >copy</button>
      </Link>
    );    
  } else {
      return (
        <span className={
          cx(styles.linHash, { 
            [styles.linHashMarginLeft] : marginLeft,
            [styles.noCopy] : noCopy,
            [styles.hashText]: true
          })}>
          <Hash value={value} />
          <button 
            className={styles.copyButton} 
            title='click to copy'
            onClick={copyFunc}
          >copy</button>
        </span>
      );

  }

}
