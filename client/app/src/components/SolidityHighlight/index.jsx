import * as React from 'react';
const styles = require("./SolidityHighlight.less");

import hljs from 'highlight.js';

var ReactDOM = require('react-dom');

require('./railscasts.scss');

// hljs.initHighlightingOnLoad();
// const Code = ({ children }) => (
//   <textarea className={styles.code} rows="25" cols="60" value={children} onChange={()=>{}}>
//   </textarea>
// );

// import css from 'highlight.js/styles/'

import hljsDefineSolidity from './hljsDefineSolidity';

hljs.registerLanguage('solidity', hljsDefineSolidity);

class Highlight extends React.Component {
  constructor(props) {
    super(props);
    this.highlightCode = this.highlightCode.bind(this);
  }

    componentDidMount() {
        this.highlightCode();
    }

    componentDidUpdate() {
        this.highlightCode();
    }

    highlightCode() {
        var domNode = ReactDOM.findDOMNode(this);
        var nodes = domNode.querySelectorAll('pre code');
        if (nodes.length > 0) {
            for (var i = 0; i < nodes.length; i=i+1) {
                hljs.highlightBlock(nodes[i]);
            }
        }
    }

  render() {
    const { children } = this.props;
    const className = 'solidity';

    return (
        <div className={styles.codeContainer}>
            <pre key='598dhwpx5' className={styles.code}>
                <code key='d4mz31tt' className={className}>
                {this.props.children}
                </code>
            </pre>
        </div>
    );
  }
}


export default Highlight;
